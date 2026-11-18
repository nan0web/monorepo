import { ModelAsApp, show, ask } from '@nan0web/ui'

/**
 * SyncWorkspaceApp — command to synchronize workspace state and re-index agents.
 * Syncs workflows from packages to editor mounts via injected $db.
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
		done: 'All AI assistants (Antigravity, VSCode, Cursor) are now synchronized.',
	}

	/**
	 * @param {Partial<SyncWorkspaceApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
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
		const db = this.$db || this._.db
		if (!db) {
			yield show('DB is required for SyncWorkspaceApp', 'error')
			return
		}

		yield show(t(SyncWorkspaceApp.UI.syncStarted), 'info')

		try {
			const identity = (await db.loadDocument('@ws/identity', null).catch(() => null)) || {}
			const publicIdentity = identity.publicKey ? { publicKey: identity.publicKey } : {}

			const aiPkg = await db.loadDocument('@ws/packages/ai/package', null).catch(() => null)
			const locale = this.locale || /** @type {any} */ (this._).locale || 'uk'
			let aiWorkflowsDir = '@ws/packages/ai/workflows'
			if (aiPkg && aiPkg.nan0web?.workflowDir) {
				const relativeWorkflowDir = aiPkg.nan0web.workflowDir.replace('{locale}', locale)
				aiWorkflowsDir = `@ws/packages/ai/${relativeWorkflowDir}`
			}

			const workflows = await db.listDir(aiWorkflowsDir).catch(() => [])
			const targets = [
				{ name: 'Antigravity', db: '@gemini/global_workflows' },
				{ name: 'VSCode', db: '@vscode/workflows' },
				{ name: 'Cursor', db: '@cursor/rules' },
			]

			for (const target of targets) {
				for (const file of workflows) {
					if (!file.name.endsWith('.md')) continue
					const baseName = file.name.slice(0, -3)
					const content = await db.loadDocument(`${aiWorkflowsDir}/${baseName}`)
					await db.saveDocument(`${target.db}/${baseName}`, content)
				}

				if (publicIdentity.publicKey) {
					await db.saveDocument(`${target.db}/identity.pub`, publicIdentity)
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
