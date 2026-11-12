import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { FastApiDiscovery } from '../../../../src/domain/ast/FastApiDiscovery.js'
import { FastApiApp } from '../../../../src/domain/app/FastApiApp.js'
import { InstallApp } from '../../../../src/domain/app/InstallApp.js'
import { DoctorApp } from '../../../../src/domain/app/DoctorApp.js'
import { InspectorApp } from '../../../../src/domain/app/InspectorApp.js'
import { server, runAuditor } from '../../../../src/ui/mcp.js'
import { ArchitectureAuditor } from '../../../../src/domain/app/ArchitectureAuditor.js'
import { CircularDependencyAuditor } from '../../../../src/domain/app/CircularDependencyAuditor.js'
import { StructureAuditor } from '../../../../src/domain/app/StructureAuditor.js'
import { BuildWorkflowsApp } from '../../../../src/domain/app/BuildWorkflowsApp.js'
import { InspectConfig } from '../../../../src/domain/config/InspectConfig.js'
import { AuditorModel } from '../../../../src/domain/AuditorModel.js'

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

describe('v3.9.0: Fast API Discovery, Editor Installer, MCP Bridge & Technical Hygiene', () => {
	describe('§1 Fast API Discovery (AST Contractor)', () => {
		it('should parse a d.ts file and extract class signatures without implementation', async () => {
			const sampleDts = `
				/** Auditor model description */
				export class AuditorModel {
					static alias: string;
					/** Initializes auditor */
					async init(): Promise<void>;
					fileExists(rel: string): Promise<boolean>;
				}
			`
			const discovery = new FastApiDiscovery()
			const result = discovery.extractFromSource(sampleDts, { fileName: 'AuditorModel.d.ts' })

			assert.ok(result.exports.AuditorModel, 'Should contain AuditorModel export')
			assert.equal(result.exports.AuditorModel.description, 'Auditor model description')
			assert.ok(result.exports.AuditorModel.methods.find((m) => m.name === 'init' && m.isAsync))
		})

		it('should filter by level and only options', async () => {
			const sampleDts = `
				export class TestService {
					static config: object;
					async fetchData(): Promise<string>;
					syncHelper(): void;
				}
			`
			const discovery = new FastApiDiscovery()

			// Test --only async
			const asyncOnly = discovery.extractFromSource(sampleDts, { only: 'async' })
			const methods = asyncOnly.exports.TestService.methods
			assert.equal(methods.length, 1)
			assert.equal(methods[0].name, 'fetchData')

			// Test --only static
			const staticOnly = discovery.extractFromSource(sampleDts, { only: 'static' })
			assert.equal(staticOnly.exports.TestService.fields.length, 1)
			assert.equal(staticOnly.exports.TestService.fields[0].name, 'config')
			assert.equal(staticOnly.exports.TestService.methods.length, 0)

			// Test --level classes
			const classesOnly = discovery.extractFromSource(sampleDts, { level: 'classes' })
			assert.equal(classesOnly.exports.TestService.methods, undefined)
			assert.equal(classesOnly.exports.TestService.fields, undefined)

			// Test --level methods
			const methodsOnly = discovery.extractFromSource(sampleDts, { level: 'methods' })
			assert.ok(methodsOnly.exports.TestService.methods.length > 0)
			assert.equal(methodsOnly.exports.TestService.fields, undefined)
		})

		it('should extract dependencies when --include-deps is enabled', async () => {
			const sampleDts = `
				import type { Model } from '@nan0web/types'
				import { DB } from '@nan0web/db'

				export class RepoService {
					db: DB;
					getModel(): Model;
				}
			`
			const discovery = new FastApiDiscovery()
			const result = discovery.extractFromSource(sampleDts, { includeDeps: true })

			assert.ok(result.deps, 'Should include dependencies list')
			assert.ok(result.deps.includes('@nan0web/types'))
			assert.ok(result.deps.includes('@nan0web/db'))
		})

		it('should format output as concise Nano/YAML outline', async () => {
			const sampleDts = `
				export class MiniModel {
					/** Name of model */
					name: string;
					/** Save data */
					async save(): Promise<void>;
				}
			`
			const discovery = new FastApiDiscovery()
			const outline = discovery.stringify(discovery.extractFromSource(sampleDts))

			assert.match(outline, /MiniModel:/)
			assert.match(outline, /save\(\):/)
		})

		it('should extract API from file using DB in FastApiDiscovery.extractFromFile', async () => {
			const sampleDts = `
				export class FileModel {
					path: string;
				}
			`
			const db = new DB({
				predefined: [['types/FileModel.d.ts', sampleDts]],
			})
			await db.connect()

			const discovery = new FastApiDiscovery({ db })
			const result = await discovery.extractFromFile('types/FileModel.d.ts')

			assert.ok(result.exports.FileModel)
			assert.equal(result.exports.FileModel.fields[0].name, 'path')
		})

		it('should run FastApiApp subcommand and integrate with InspectorApp', async () => {
			const sampleDts = `
				export class CliModel {
					version: string;
					run(): void;
				}
			`
			const db = new DB({
				predefined: [['types/CliModel.d.ts', sampleDts]],
			})
			await db.connect()

			// Test FastApiApp standalone
			const apiApp = new FastApiApp({ path: 'types/CliModel.d.ts', level: 'all', format: 'nano' }, { db })
			const res = await drainGenerator(apiApp.run())
			assert.equal(res.result.data.ok, true)
			assert.match(res.result.data.outline, /CliModel:/)

			// Test InspectorApp with 'api' subcommand
			const inspector = new InspectorApp({ command: 'api', dir: 'types/CliModel.d.ts' }, { db })
			const inspRes = await drainGenerator(inspector.run())
			assert.equal(inspRes.result.data.ok, true)
			assert.ok(inspRes.result.data.outline)
		})
	})

	describe('§2 Editor Discovery & Safe Deep Merge Configuration (InstallApp & DoctorApp)', () => {
		it('should detect Antigravity, Cursor, VS Code, and Claude Desktop environments via In-Memory DB', async () => {
			const db = new DB()
			const homedir = '/home/developer'
			const cwd = '/workspace/project'

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

		it('should validate MCP configuration files and output health status (DoctorApp)', async () => {
			const db = new DB()
			const homedir = '/home/user'
			const cwd = '/workspace/checked'

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
			assert.ok(
				intents.some((i) => i.level === 'success' || i.message?.includes('Green Ready')),
				'Should display green readiness badge'
			)
		})

		it('should register install and doctor subcommands in InspectorApp', async () => {
			const commands = InspectorApp.command.options || []
			assert.ok(commands.includes(InstallApp), 'InspectorApp must include InstallApp subcommand')
			assert.ok(commands.includes(DoctorApp), 'InspectorApp must include DoctorApp subcommand')
		})

		it('should export inspect_api_contract tool in MCP Server and execute it', async () => {
			const listHandler = server._requestHandlers?.get('tools/list')
			assert.ok(listHandler, 'tools/list handler should be registered')

			const response = await listHandler({ method: 'tools/list', params: {} })
			const apiTool = response.tools.find((t) => t.name === 'inspect_api_contract')

			assert.ok(apiTool, 'inspect_api_contract tool must be registered in MCP server')
			assert.ok(apiTool.inputSchema.properties.path, 'inputSchema must declare path property')

			const callHandler = server._requestHandlers?.get('tools/call')
			assert.ok(callHandler, 'tools/call handler should be registered')

			const callResponse = await callHandler({
				method: 'tools/call',
				params: {
					name: 'inspect_api_contract',
					arguments: {
						path: 'packages/inspect/types/domain/ast/FastApiDiscovery.d.ts',
						level: 'methods',
					},
				},
			})

			assert.equal(callResponse.isError, false, 'Execution should not be an error')
			assert.ok(Array.isArray(callResponse.content), 'Content should be array')
			assert.ok(callResponse.content[0].text.includes('FastApiDiscovery'), 'Should contain extracted AST output')
		})
	})

	describe('§3 Model-as-Schema & Technical Hygiene (Self-Inspection)', () => {
		it('AuditorModel declares timeout with JSDoc @type in constructor', () => {
			const model = new AuditorModel({ timeout: 45 })
			assert.equal(model.timeout, 45)
		})

		it('InspectConfig declares snapshots and rules in constructor without missing field warnings', () => {
			const config = new InspectConfig({
				snapshots: { optional: true },
				rules: { testRule: true },
			})
			assert.equal(config.snapshots.optional, true)
			assert.equal(config.rules.testRule, true)
		})

		it('ArchitectureAuditor avoids redundant manual assignment of skip', () => {
			const auditor = new ArchitectureAuditor({ skip: 'circular' })
			assert.equal(auditor.skip, 'circular')
		})

		it('StructureAuditor uses fileExists/dirExists on DB rather than node:fs', async () => {
			const db = new DB({
				predefined: [
					['system.md', '# System'],
					['playground/index.html', '<html/>'],
				],
			})
			await db.connect()

			const auditor = new StructureAuditor({ dir: '.' }, { db, t: (k) => k })
			const gen = auditor.run()
			let last = null
			while (true) {
				const step = await gen.next()
				if (step.done) {
					last = step.value
					break
				}
			}

			const data = last?.data || last
			assert.equal(data.ok, true)
			assert.equal(data.errors.length, 0)
		})

		it('BuildWorkflowsApp uses DB for file operations and manifest compilation', async () => {
			const db = new DB({
				predefined: [
					[
						'nan0web.nan0',
						`name: "test-workspace"
agents:
  - id: "agent-1"
    workflows:
      - "docs/uk/workflows/test.md"
`,
					],
					[
						'docs/uk/workflows/test.md',
						`---
id: "test-wf"
name: "Test"
lang: "uk"
---
# Content`,
					],
				],
			})
			await db.connect()

			const app = new BuildWorkflowsApp({ dir: '.' }, { db, t: (k) => k })
			const gen = app.run()
			let last = null
			while (true) {
				const step = await gen.next()
				if (step.done) {
					last = step.value
					break
				}
			}

			const data = last?.data || last
			assert.equal(data.ok, true)
			assert.equal(data.ukCount, 1)
		})
	})
})
