import os from 'node:os'
import path from 'node:path'
import { ModelAsApp } from '@nan0web/ui-cli'
import { DBFS } from '@nan0web/db-fs'
import { DB } from '@nan0web/db'

/**
 * SyncWorkspaceApp — command to synchronize workspace state and re-index agents.
 * Syncs workflows from packages to global AI assistant storage.
 */
export class SyncWorkspaceApp extends ModelAsApp {
	static alias = 'sync'
	static locale = {
		help: 'Locale of workflows to synchronize (e.g., uk, en)',
		default: '',
	}
	static UI = {
		syncStarted: 'Starting global synchronization across all editors...',
		workflowsSynced: 'Workflows & Rules synced to {target}',
		done: 'All AI assistants (Antigravity, VSCode, etc.) are now synchronized.',
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { show, ask } = await import('@nan0web/ui')

		if (this.help) {
			const content = this.generateHelp()
			if (this.raw) {
				yield show(content, 'info', /** @type {any} */ ({ format: 'markdown', raw: true }))
				return
			}
			const title = /** @type {any} */ (this.constructor).UI?.title || 'Help'
			yield ask('help', { content, title: `${title} Help`, hint: 'content-viewer' })
			return
		}

		const { t } = this._
		const db = new DB()

		let workspaceRoot = path.resolve(/** @type {any} */ (this._).workspaceRoot || process.cwd())
		let current = workspaceRoot
		while (current && current !== '/') {
			const tempDb = new DBFS({ cwd: current, root: '' })
			const stat = await tempDb.statDocument('pnpm-workspace.yaml')
			if (stat.exists) {
				workspaceRoot = current
				break
			}
			const parent = path.dirname(current)
			if (parent === current) break
			current = parent
		}

		db.mount('@app', new DBFS({ cwd: process.cwd(), root: '' }))
		db.mount('@ws', new DBFS({ cwd: workspaceRoot, root: '' }))

		yield show(t(SyncWorkspaceApp.UI.syncStarted), 'info')

		// Global Targets
		const antigravityGlobal = new DBFS({
			cwd: os.homedir(),
			root: '.gemini/antigravity/global_workflows',
		})
		const vscodeGlobal = new DBFS({
			cwd: os.homedir(),
			root: '.vscode/extensions/nan0web/workflows',
		})
		const cursorGlobal = new DBFS({ cwd: os.homedir(), root: '.cursor/rules' })

		db.mount('@antigravity', antigravityGlobal)
		db.mount('@vscode', vscodeGlobal)
		db.mount('@cursor', cursorGlobal)

		try {
			// 1. Load Identity
			const identity = (await db.get('@ws/identity.json').catch(() => ({}))) || {}

			// Only sync public key
			const publicIdentity = identity.publicKey ? { publicKey: identity.publicKey } : {}

			// 2. Discover workflows in @nan0web/ai
			let aiWorkflowsDir = '@ws/packages/ai/workflows'
			const aiPkg = await db.get('@ws/packages/ai/package.json').catch(() => null)
			if (aiPkg && aiPkg.nan0web) {
				const systemLocale = (process.env.LANG || 'uk').split('.')[0].split('_')[0]
				const self = /** @type {any} */ (this)
				const locale = self.locale || self._.locale || systemLocale
				const relativeWorkflowDir = aiPkg.nan0web.workflowDir.replace('{locale}', locale)
				aiWorkflowsDir = `@ws/packages/ai/${relativeWorkflowDir}`
			}
			const workflows = await db.listDir(aiWorkflowsDir).catch(() => [])

			// 3. Define Targets from Ecosystem
			const targets = [
				{ name: 'Antigravity', db: '@antigravity', path: '.gemini/antigravity/global_workflows' },
				{ name: 'VSCode', db: '@vscode', path: '.vscode/extensions/nan0web/workflows' },
				{ name: 'Cursor', db: '@cursor', path: '.cursor/rules' },
			]

			for (const target of targets) {
				// Sync Workflows
				for (const file of workflows) {
					if (!file.name.endsWith('.md')) continue
					const content = await db.fetch(`${aiWorkflowsDir}/${file.name}`)
					await db.saveDocument(`${target.db}/${file.name}`, content)
				}

				// Sync Identity (Public Key)
				if (publicIdentity.publicKey) {
					await db.saveDocument(`${target.db}/identity.pub.json`, publicIdentity)
				}

				yield show(t(SyncWorkspaceApp.UI.workflowsSynced, { target: target.name }), 'success')
			}

			yield show(t(SyncWorkspaceApp.UI.done), 'success')
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			yield show(message, 'error')
		}
	}
}
