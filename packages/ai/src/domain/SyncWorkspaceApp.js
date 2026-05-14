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
		const root = /** @type {any} */ (this._).workspaceRoot || process.cwd()
		db.mount('@app', new DBFS({ cwd: root, root: '' }))

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
			// 1. Load Ecosystem & Identity
			const ecosystem = await db.get('@app/ecosystem.json').catch(() => ({}))
			const identity = await db.get('@app/identity.json').catch(() => ({}))

			// Only sync public key
			const publicIdentity = identity.publicKey ? { publicKey: identity.publicKey } : {}

			// 2. Discover workflows in @nan0web/ai
			const aiWorkflowsDir = '@app/packages/ai/workflows'
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

			// 4. Update Sync Timestamp in ecosystem.json
			ecosystem.lastSync = new Date().toISOString()
			await db.saveDocument('@app/ecosystem.json', ecosystem)

			yield show(t(SyncWorkspaceApp.UI.done), 'success')
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			yield show(message, 'error')
		}
	}
}
