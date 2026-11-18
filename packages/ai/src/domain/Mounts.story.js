import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { SyncWorkspaceApp } from './SyncWorkspaceApp.js'

describe('AI Package Isolated Mounts (@app, @gemini, @cursor)', () => {
	it('isolates @app, @gemini, and @cursor mounts and seals registry', async () => {
		const root = new DB()
		const appDb = new DB({
			predefined: [
				[
					'packages/ai/package.json',
					{ name: '@nan0web/ai', nan0web: { workflowDir: 'workflows/{locale}' } },
				],
			],
		})
		const geminiDb = new DB({
			predefined: [['config/mcp_config.json', { mcpServers: { existing: {} } }]],
		})
		const cursorDb = new DB({
			predefined: [['rules/existing.md', '# Existing Cursor Rule']],
		})

		await Promise.all([root.connect(), appDb.connect(), geminiDb.connect(), cursorDb.connect()])

		root.mount('@app', appDb)
		root.mount('@gemini', geminiDb)
		root.mount('@cursor', cursorDb)
		root.seal()

		assert.throws(() => root.mount('@rogue', new DB()), /Mount registry is sealed/)

		await root.saveDocument('@gemini/global_workflows/cocodev', '# CoCoDev Workflow')
		const geminiDoc = await root.loadDocument('@gemini/global_workflows/cocodev')
		assert.equal(geminiDoc, '# CoCoDev Workflow')

		// Ensure no cross-mount leakage
		const cursorCheck = await cursorDb
			.loadDocument('/global_workflows/cocodev', null)
			.catch(() => null)
		assert.equal(cursorCheck, null)
		const appCheck = await appDb.loadDocument('/global_workflows/cocodev', null).catch(() => null)
		assert.equal(appCheck, null)

		await assert.rejects(
			() => root.loadDocument('@claude/CLAUDE'),
			/Mount point "@claude" not found/
		)
	})

	it('SyncWorkspaceApp syncs workflows across @gemini, @cursor, @vscode using injected $db', async () => {
		const root = new DB()
		const wsDb = new DB({
			predefined: [
				['identity.json', { publicKey: 'ed25519:pub-key-123' }],
				[
					'packages/ai/package.json',
					{ name: '@nan0web/ai', nan0web: { workflowDir: 'workflows/{locale}' } },
				],
				['packages/ai/workflows/uk/cocodev.md', '# CoCoDev UK'],
			],
		})
		const appDb = new DB()
		const geminiDb = new DB()
		const cursorDb = new DB()
		const vscodeDb = new DB()

		await Promise.all([
			root.connect(),
			wsDb.connect(),
			appDb.connect(),
			geminiDb.connect(),
			cursorDb.connect(),
			vscodeDb.connect(),
		])

		root.mount('@ws', wsDb)
		root.mount('@app', appDb)
		root.mount('@gemini', geminiDb)
		root.mount('@cursor', cursorDb)
		root.mount('@vscode', vscodeDb)
		root.seal()

		const app = new SyncWorkspaceApp({ locale: 'uk' }, { db: root, t: (k) => k })
		const gen = app.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const geminiWorkflow = await root.loadDocument('@gemini/global_workflows/cocodev')
		assert.equal(geminiWorkflow, '# CoCoDev UK')

		const cursorWorkflow = await root.loadDocument('@cursor/rules/cocodev')
		assert.equal(cursorWorkflow, '# CoCoDev UK')

		const vscodeWorkflow = await root.loadDocument('@vscode/workflows/cocodev')
		assert.equal(vscodeWorkflow, '# CoCoDev UK')

		const geminiIdentity = await root.loadDocument('@gemini/global_workflows/identity.pub')
		assert.deepEqual(geminiIdentity, { publicKey: 'ed25519:pub-key-123' })
	})
})
