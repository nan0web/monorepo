import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { InstallApp } from '../../../../src/domain/app/InstallApp.js'
import { DoctorApp } from '../../../../src/domain/app/DoctorApp.js'
import { InspectorApp } from '../../../../src/domain/app/InspectorApp.js'
import { server, runAuditor } from '../../../../src/ui/mcp.js'

/**
 * Drain an async generator to capture all yielded intents and final return value.
 * @param {AsyncGenerator<any, any, any>} gen
 * @returns {Promise<{ intents: any[], result: any }>}
 */
async function drainGenerator(gen) {
	const intents = []
	let next = await gen.next()
	while (!next.done) {
		intents.push(next.value)
		next = await gen.next()
	}
	return { intents, result: next.value }
}

describe('v3.10.0: Cross-Editor Zero-Hallucination Installer & MCP Bridge', () => {
	describe('§1 Editor Discovery & Detection', () => {
		it('should detect Antigravity, Cursor, VS Code, and Claude Desktop environments via In-Memory DB', async () => {
			const db = new DB()
			const homedir = '/home/developer'
			const cwd = '/workspace/project'

			// Seed environment indicators
			await db.saveDocument(db.resolveSync(homedir, '.gemini/antigravity/mcp', 'config'), { mock: true })
			await db.saveDocument(db.resolveSync(cwd, '.cursor', 'mcp.json'), { mcpServers: {} })
			await db.saveDocument(db.resolveSync(cwd, '.vscode', 'settings.json'), { 'nan0.enabled': true })
			await db.saveDocument(
				db.resolveSync(homedir, 'Library/Application Support/Claude', 'claude_desktop_config.json'),
				{ mcpServers: {} }
			)

			const install = new InstallApp({ dir: cwd, homedir }, { db })
			const discovered = await install.discoverEditors()

			assert.ok(Array.isArray(discovered), 'discovered should be an array')
			assert.equal(discovered.length, 4, 'should detect all 4 configured environments')

			const antigravity = discovered.find((e) => e.id === 'antigravity')
			const cursor = discovered.find((e) => e.id === 'cursor')
			const vscode = discovered.find((e) => e.id === 'vscode')
			const claude = discovered.find((e) => e.id === 'claude')

			assert.ok(antigravity && antigravity.detected, 'Antigravity should be detected')
			assert.ok(cursor && cursor.detected, 'Cursor should be detected')
			assert.ok(vscode && vscode.detected, 'VS Code should be detected')
			assert.ok(claude && claude.detected, 'Claude should be detected')
		})

		it('should correctly report undetected editors when config files do not exist', async () => {
			const db = new DB()
			const homedir = '/home/clean'
			const cwd = '/workspace/empty'

			const install = new InstallApp({ dir: cwd, homedir }, { db })
			const discovered = await install.discoverEditors()

			assert.ok(Array.isArray(discovered))
			assert.equal(discovered.length, 4)
			assert.ok(discovered.every((e) => !e.detected), 'All should be undetected in clean workspace')
		})
	})

	describe('§2 Safe Deep Merge Configuration (InstallApp)', () => {
		it('should deep merge mcpServers without overwriting existing servers in Cursor mcp.json', async () => {
			const db = new DB()
			const homedir = '/home/user'
			const cwd = '/workspace/my-repo'

			const cursorConfigUri = db.resolveSync(cwd, '.cursor/mcp.json')
			const existingConfig = {
				mcpServers: {
					'existing-server': {
						command: 'node',
						args: ['existing.js'],
					},
				},
				customSettings: { theme: 'dark' },
			}
			await db.saveDocument(cursorConfigUri, existingConfig)

			const install = new InstallApp({ dir: cwd, homedir }, { db })
			const { intents, result } = await drainGenerator(install.run())
			const resData = result?.data || result

			assert.equal(resData?.status, 'ok', 'Install execution should succeed')

			const updated = await db.loadDocument(cursorConfigUri)
			assert.ok(updated.mcpServers['existing-server'], 'Existing server configuration must be preserved')
			assert.ok(updated.mcpServers['nan0web-inspect'], 'nan0web-inspect MCP server must be registered')
			assert.equal(updated.customSettings?.theme, 'dark', 'Existing custom settings must be preserved')

			const tableIntent = intents.find((i) => i.component === 'Table' || i.type === 'render')
			assert.ok(tableIntent, 'Should render Table OLMUI intent with discovery summary')
		})

		it('should create new mcp configuration if none existed previously for detected editor', async () => {
			const db = new DB()
			const homedir = '/home/user'
			const cwd = '/workspace/fresh'

			// Seed directory presence so editor is detected
			await db.saveDocument(db.resolveSync(cwd, '.cursor', 'presence'), {})

			const install = new InstallApp({ dir: cwd, homedir }, { db })
			await drainGenerator(install.run())

			const cursorConfigUri = db.resolveSync(cwd, '.cursor/mcp.json')
			const config = await db.loadDocument(cursorConfigUri)
			assert.ok(config?.mcpServers?.['nan0web-inspect'], 'nan0web-inspect must be created')
		})
	})

	describe('§3 Diagnostics & Health Check (DoctorApp)', () => {
		it('should validate MCP configuration files and output health status', async () => {
			const db = new DB()
			const homedir = '/home/user'
			const cwd = '/workspace/checked'

			// Install first
			await db.saveDocument(db.resolveSync(cwd, '.cursor', 'mcp.json'), {
				mcpServers: {
					'nan0web-inspect': {
						command: 'node',
						args: ['/abs/path/to/mcp.js'],
					},
				},
			})

			const doctor = new DoctorApp({ dir: cwd, homedir }, { db })
			const { intents, result } = await drainGenerator(doctor.run())
			const resData = result?.data || result

			assert.equal(resData?.status, 'ok', 'Doctor check should return ok')
			assert.ok(intents.some((i) => i.component === 'Table' || i.type === 'render'), 'Should render Table status')
			assert.ok(intents.some((i) => i.level === 'success' || i.message?.includes('Green Ready')), 'Should display green readiness badge')
		})

		it('should warn when no editors or configured MCP servers are found', async () => {
			const db = new DB()
			const homedir = '/home/empty'
			const cwd = '/workspace/empty'

			const doctor = new DoctorApp({ dir: cwd, homedir }, { db })
			const { intents, result } = await drainGenerator(doctor.run())
			const resData = result?.data || result

			assert.equal(resData?.status, 'warning', 'Should return warning status when no editors installed')
		})
	})

	describe('§4 InspectorApp Integration', () => {
		it('should register install and doctor subcommands in InspectorApp', async () => {
			const commands = InspectorApp.command.options || []
			assert.ok(commands.includes(InstallApp), 'InspectorApp must include InstallApp subcommand')
			assert.ok(commands.includes(DoctorApp), 'InspectorApp must include DoctorApp subcommand')
		})
	})

	describe('§5 MCP Server inspect_api_contract Tool', () => {
		it('should export inspect_api_contract tool in MCP Server', async () => {
			const listHandler = server._requestHandlers?.get('tools/list')
			assert.ok(listHandler, 'tools/list handler should be registered')

			const response = await listHandler({ method: 'tools/list', params: {} })
			const apiTool = response.tools.find((t) => t.name === 'inspect_api_contract')

			assert.ok(apiTool, 'inspect_api_contract tool must be registered in MCP server')
			assert.ok(apiTool.inputSchema.properties.path, 'inputSchema must declare path property')
		})

		it('should execute inspect_api_contract tool and return extracted contract AST', async () => {
			const callHandler = server._requestHandlers?.get('tools/call')
			assert.ok(callHandler, 'tools/call handler should be registered')

			const response = await callHandler({
				method: 'tools/call',
				params: {
					name: 'inspect_api_contract',
					arguments: {
						path: 'packages/inspect/types/domain/ast/FastApiDiscovery.d.ts',
						level: 'methods',
					},
				},
			})

			assert.equal(response.isError, false, 'Execution should not be an error')
			assert.ok(Array.isArray(response.content), 'Content should be array')
			assert.ok(response.content[0].text.includes('FastApiDiscovery'), 'Should contain extracted AST output')
		})
	})
})
