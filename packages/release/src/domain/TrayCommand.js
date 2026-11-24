import { ModelAsApp, result, show } from '@nan0web/ui'
import { Markdown } from '@nan0web/markdown'
import { TodoCommand } from './TodoCommand.js'
import { ProjectsMap } from './Task/ProjectsMap.js'
import { SwiftBarAdapter } from '../adapters/SwiftBarAdapter.js'
import { SystemAdapter } from '../adapters/SystemAdapter.js'

/**
 * TrayCommand (ModelAsApp)
 * Renders SwiftBar menu and handles tray actions (set-status, open-antigravity).
 */
export class TrayCommand extends ModelAsApp {
	static alias = 'tray'

	static UI = {
		title: 'SwiftBar Task Tray Controller',
	}

	static action = { type: 'string', positional: true, default: 'render', help: 'Action: render, set-status, open-antigravity' }
	static file = { type: 'string', default: 'todo.md', help: 'Target markdown file' }
	static status = { type: 'string', default: '', help: 'New status: todo, work, done, pause, fail' }
	static target = { type: 'string', default: '', help: 'Task target title or index' }
	static project = { type: 'string', default: '', help: 'Project key for open-antigravity' }
	static binPath = { type: 'string', default: '', help: 'Explicit binary path' }
	static binMode = { type: 'string', default: 'bin', help: 'Invocation mode: bin | node' }

	/**
	 * @param {Partial<TrayCommand>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.action
		/** @type {string} */ this.file
		/** @type {string} */ this.status
		/** @type {string} */ this.target
		/** @type {string} */ this.project
		/** @type {string} */ this.binPath
		/** @type {string} */ this.binMode
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * @param {string} filePath
	 * @returns {Promise<import('./Task/TaskModel.js').TaskModel[]>}
	 */
	async loadTasksFrom(filePath) {
		const doc = await this.$db.loadDocument(filePath, null).catch(() => null)
		if (!doc) return []
		const content = typeof doc === 'string' ? doc : String(doc)
		return TodoCommand.extractTasks(new Markdown(content), filePath)
	}

	/**
	 * Mirror status update between todo.md and pool.md.
	 * @returns {Promise<{ ok: boolean, updatedFiles: string[] }>}
	 */
	async handleSetStatus() {
		const updatedFiles = []
		const files = [...new Set([this.file, 'todo.md', 'pool.md'])]
		for (const f of files) {
			const doc = await this.$db.loadDocument(f, null).catch(() => null)
			if (!doc) continue
			const ast = doc instanceof Markdown ? doc : new Markdown(String(doc))
			if (TodoCommand.mutateTask(ast, this.target, /** @type {any} */ (this.status))) {
				await this.$db.saveDocument(f, String(ast))
				updatedFiles.push(f)
			}
		}
		return { ok: updatedFiles.length > 0, updatedFiles }
	}

	async *run() {
		const projectsMap = await ProjectsMap.load(this.$db)

		if (this.action === 'open-antigravity') {
			const res = await projectsMap.openInIde(this.project, this.$system)
			yield show(res.ok ? `Opened ${res.dir}` : `Project not found: ${this.project}`, res.ok ? 'success' : 'error')
			return result(res)
		}

		if (this.action === 'set-status') {
			const res = await this.handleSetStatus()
			yield show(res.ok ? `Updated: ${res.updatedFiles.join(', ')}` : `Task not found: ${this.target}`, res.ok ? 'success' : 'warn')
			return result(res)
		}

		const today = await this.loadTasksFrom(this.file)
		const pool = await this.loadTasksFrom('pool.md')
		const future = await this.loadTasksFrom('future.md')
		const output = SwiftBarAdapter.render({
			today,
			pool,
			future,
			pendingOld: [],
			projects: projectsMap.entries,
			binPath: this.binPath,
			binMode: this.binMode,
		})
		yield show(output)
		return result({ ok: true, output })
	}
}

export default TrayCommand
