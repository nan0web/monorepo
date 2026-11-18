import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { InstallApp } from './InstallApp.js'
import { EditorDetector } from './EditorDetector.js'

describe('InstallApp — Global Cascade AGENTS.md Rule', () => {
	it('EditorDetector.EDITORS defines globalRuleUri for all 4 supported editors', () => {
		const ids = EditorDetector.EDITORS.map((e) => e.id)
		assert.deepEqual(ids, ['antigravity', 'cursor', 'vscode', 'claude'])

		for (const editor of EditorDetector.EDITORS) {
			assert.ok(
				typeof editor.globalRuleUri === 'string' && editor.globalRuleUri.length > 0,
				`Expected globalRuleUri for ${editor.id}`
			)
		}
	})

	it('InstallApp exposes rules option defaulting to true', () => {
		assert.equal(InstallApp.rules.type, 'boolean')
		assert.equal(InstallApp.rules.default, true)
		const app = new InstallApp()
		assert.equal(app.rules, true)
	})

	it('syncs global cascade AGENTS.md rule to all 4 detected editors', async () => {
		const db = new DB()
		// Mount in-memory or virtual paths via DBFS? Better: use DB with Memory / pre-populated mock or DBFS?
		// Let's check how DB is mocked or used in tests: we can stub db methods cleanly!
		const saved = new Map()
		const mockDb = {
			location: (uri) => `/abs/${uri}`,
			resolveSync: (dir, name) => `${dir}/${name}`,
			dirname: (uri) => uri.split('/').slice(0, -1).join('/') || '.',
			stat: async (uri) => {
				if (
					uri === '@gemini/config/mcp_config.json' ||
					uri === '@cursor-local/mcp.json' ||
					uri === '@vscode-local/settings.json' ||
					uri === '@claude/claude_desktop_config.json'
				) {
					return { isFile: true, isDirectory: false }
				}
				return null
			},
			listDir: async () => [],
			loadDocument: async () => ({}),
			saveDocument: async (uri, data) => {
				saved.set(uri, data)
			},
		}

		const app = new InstallApp({ mcp: false, skills: false, rules: true }, { db: mockDb })
		const intents = []
		for await (const intent of app.run()) {
			intents.push(intent)
		}

		assert.ok(intents.length > 0)

		for (const editor of EditorDetector.EDITORS) {
			const content = saved.get(editor.globalRuleUri)
			assert.ok(
				typeof content === 'string' && content.length > 0,
				`Rule was not saved for ${editor.id} at ${editor.globalRuleUri}`
			)
			assert.match(content, /AGENTS\.md/)
			assert.match(content, /frontmatter/i)
			assert.match(content, /parent:/i)
			assert.match(content, /\.\.\/AGENTS\.md/)
			assert.match(content, /L_0|L0/)
			assert.match(content, /воркфлоу|workflow/i)
		}
	})

	it('does not sync global rule when rules is false', async () => {
		const saved = new Map()
		const mockDb = {
			location: (uri) => `/abs/${uri}`,
			resolveSync: (dir, name) => `${dir}/${name}`,
			dirname: (uri) => uri.split('/').slice(0, -1).join('/') || '.',
			stat: async (uri) => {
				if (uri === '@gemini/config/mcp_config.json') {
					return { isFile: true, isDirectory: false }
				}
				return null
			},
			listDir: async () => [],
			loadDocument: async () => ({}),
			saveDocument: async (uri, data) => {
				saved.set(uri, data)
			},
		}

		const app = new InstallApp({ mcp: false, skills: false, rules: false }, { db: mockDb })
		for await (const _intent of app.run()) {
			// consume
		}

		assert.equal(saved.size, 0)
	})
})
