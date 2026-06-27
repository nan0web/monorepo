import { show, result, ModelAsApp, render } from '@nan0web/ui'

/**
 * WorkflowListModel — lists all available workflow files.
 */
export class WorkflowListModel extends ModelAsApp {
	static alias = 'list'

	static UI = {
		title: '📋 Available Workflows',
		empty: 'No workflows found in data/{locale}/workflows/',
		errorNoDb: 'DB not available',
		errorNoWorkflowsDir: 'No workflows directory found: data/{locale}/workflows/',
	}

	static locale = {
		help: 'Locale to use for workflows',
		default: 'uk',
	}

	/**
	 * @param {Partial<WorkflowListModel>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Workflow locale */ this.locale
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, db } = this._

		if (!db) {
			yield show(t(WorkflowListModel.UI.errorNoDb), 'error')
			return result({ ok: false })
		}

		await db.connect()

		const entries = []
		try {
			for await (const entry of db.readDir(`@data/${this.locale}/workflows`)) {
				if (!entry) continue
				const full = entry.path || entry.name || ''
				const name = String(full).split('/').pop() || full
				if (String(name).endsWith('.md')) {
					const alias = name.replace(/\.md$/, '')
					entries.push({ name, alias })
				}
			}
		} catch (e) {
			yield show(t(WorkflowListModel.UI.errorNoWorkflowsDir, { locale: this.locale }), 'warn')
			return result({ ok: true, workflows: [] })
		}

		if (entries.length === 0) {
			yield show(t(WorkflowListModel.UI.empty), 'warn')
			return result({ ok: true, workflows: [] })
		}

		yield render('Alert', {
			title: t(WorkflowListModel.UI.title),
			message: entries.map((e) => e.name).join('\n'),
			variant: 'success',
		})

		return result({ ok: true, workflows: entries.map((e) => e.alias) })
	}
}

/**
 * WorkflowShowModel — outputs the content of a single workflow file.
 */
export class WorkflowShowModel extends ModelAsApp {
	static alias = 'show'

	static UI = {
		title: '📄 Workflow: {name}',
		notFound: 'Workflow not found: {name}',
		promptName: 'Enter workflow name (e.g. nan0web):',
	}

	static name = {
		help: 'Workflow name (without .md extension)',
		default: '',
		positional: true,
	}

	static locale = {
		help: 'Locale to use for workflows',
		default: 'uk',
	}

	/**
	 * @param {Partial<WorkflowShowModel>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Workflow name */ this.name
		/** @type {string} Locale */ this.locale
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, db } = this._

		if (!db) {
			yield show('DB not available', 'error')
			return result({ ok: false })
		}

		await db.connect()

		if (!this.name) {
			yield show(t(WorkflowShowModel.UI.promptName), 'warn')
			return result({ ok: false })
		}

		const filename = this.name.endsWith('.md') ? this.name : `${this.name}.md`
		const path = `@data/${this.locale}/workflows/${filename}`

		let content = ''
		try {
			content = await db.loadDocumentAs('.txt', path, '')
			if (typeof content !== 'string' || !content) throw new Error('empty')
		} catch (e) {
			yield show(t(WorkflowShowModel.UI.notFound, { name: this.name }), 'error')
			return result({ ok: false })
		}

		yield show(t(WorkflowShowModel.UI.title, { name: this.name }))
		yield show(content)

		return result({ ok: true, name: this.name, content })
	}
}

/**
 * WorkflowApp — container command for workflow management.
 * Subcommands: list, show.
 */
export class WorkflowApp extends ModelAsApp {
	static alias = 'workflow'

	static UI = {
		title: '📚 LLiMo Workflows',
		description: 'List and view available AI agent workflows.',
	}

	static command = {
		help: 'Workflow subcommand (list, show)',
		options: [WorkflowListModel, WorkflowShowModel],
		default: WorkflowListModel,
		positional: true,
	}

	/**
	 * @param {Partial<WorkflowApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {WorkflowListModel | WorkflowShowModel} */ this.command
	}
}
