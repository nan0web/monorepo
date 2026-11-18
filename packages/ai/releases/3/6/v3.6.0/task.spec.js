import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { EditorDetector } from '../../../../src/domain/EditorDetector.js'
import { InstallApp } from '../../../../src/domain/InstallApp.js'
import { AiAppModel } from '../../../../src/domain/AiAppModel.js'

/**
 * Helper to create an In-Memory DB with all virtual mounts for editor detection.
 */
function createMountedDB() {
	const db = new DB()
	db.mount('@app', new DB({ root: '/app' }))
	db.mount('@gemini', new DB({ root: '/gemini' }))
	db.mount('@gemini-local', new DB({ root: '/gemini-local' }))
	db.mount('@cursor', new DB({ root: '/cursor' }))
	db.mount('@cursor-local', new DB({ root: '/cursor-local' }))
	db.mount('@vscode', new DB({ root: '/vscode' }))
	db.mount('@vscode-local', new DB({ root: '/vscode-local' }))
	db.mount('@claude', new DB({ root: '/claude' }))
	return db
}

describe('Release v3.6.0: nan0ai install & EditorDetector', () => {
	it('EditorDetector discovers installed editors via virtual mounts (Antigravity, Cursor, VS Code, Claude)', async () => {
		const db = createMountedDB()

		await db.saveDocument('@gemini/config/mcp_config.json', { mcpServers: {} })
		await db.saveDocument('@cursor-local/mcp.json', { mcpServers: {} })
		await db.saveDocument('@vscode-local/settings.json', {})

		const detector = new EditorDetector({}, { db })
		const editors = await detector.discoverEditors()

		const agy = editors.find((e) => e.id === 'antigravity')
		const cursor = editors.find((e) => e.id === 'cursor')
		const vscode = editors.find((e) => e.id === 'vscode')
		const claude = editors.find((e) => e.id === 'claude')

		assert.ok(agy && agy.detected, 'Antigravity should be detected')
		assert.equal(
			agy.configUri,
			'@gemini/config/mcp_config.json',
			'Antigravity configUri must use @gemini mount'
		)
		assert.ok(cursor && cursor.detected, 'Cursor should be detected')
		assert.equal(cursor.configUri, '@cursor-local/mcp.json', 'Cursor configUri must use @cursor-local mount')
		assert.ok(vscode && vscode.detected, 'VS Code should be detected')
		assert.equal(vscode.configUri, '@vscode-local/settings.json', 'VS Code configUri must use @vscode-local mount')
		assert.ok(claude && !claude.detected, 'Claude should not be detected when absent')
	})

	it('InstallApp registers nan0web-knowledge without overwriting existing MCP servers', async () => {
		const db = createMountedDB()

		await db.saveDocument('@gemini/config/mcp_config.json', {
			mcpServers: {
				'existing-server': { command: 'node', args: ['/existing.js'] },
			},
		})
		await db.saveDocument('@vscode-local/settings.json', {
			'mcp.servers': {
				'other-vscode-mcp': { command: 'npx', args: ['other'] },
			},
		})

		const app = new InstallApp({ skills: false }, { db })
		for await (const _ of app.run()) {
			// consume generator
		}

		const agyConfig = await db.loadDocument('@gemini/config/mcp_config.json')
		assert.ok(agyConfig.mcpServers['existing-server'], 'Existing server must be preserved in Antigravity')
		assert.ok(agyConfig.mcpServers['nan0web-knowledge'], 'nan0web-knowledge must be registered')
		assert.ok(
			agyConfig.mcpServers['nan0web-knowledge'].args[0].endsWith('bin/mcp-server.js'),
			'MCP server path must point to bin/mcp-server.js'
		)

		const vscodeConfig = await db.loadDocument('@vscode-local/settings.json')
		assert.ok(
			vscodeConfig['mcp.servers']['other-vscode-mcp'],
			'Existing server must be preserved in VS Code'
		)
		assert.ok(
			vscodeConfig['mcp.servers']['nan0web-knowledge'],
			'nan0web-knowledge must be registered in VS Code'
		)
	})

	it('InstallApp syncs skills locally or globally based on the global attribute', async () => {
		const db = createMountedDB()

		await db.saveDocument('@app/docs/uk/workflows/architechnomag.md', '# Architechnomag')
		await db.saveDocument('@gemini/config/mcp_config.json', { mcpServers: {} })

		// Local install (global: false)
		const localApp = new InstallApp({ global: false, mcp: false }, { db })
		for await (const _ of localApp.run()) {
			// consume
		}
		const localSkill = await db.loadDocument('@gemini-local/skills/architechnomag.md').catch(() => null)
		assert.ok(localSkill, 'Skill should be synced locally to @gemini-local/skills when global is false')

		// Global install (global: true)
		const globalApp = new InstallApp({ global: true, mcp: false }, { db })
		for await (const _ of globalApp.run()) {
			// consume
		}
		const globalSkill = await db.loadDocument('@gemini/config/skills/architechnomag.md').catch(() => null)
		assert.ok(globalSkill, 'Skill should be synced globally to @gemini/config/skills when global is true')
	})

	it('AiAppModel includes InstallApp as "install" subcommand', () => {
		assert.ok(AiAppModel.command.options.includes(InstallApp), 'AiAppModel.command.options must include InstallApp')
		assert.equal(InstallApp.alias, 'install', 'InstallApp alias must be "install"')
	})
})
