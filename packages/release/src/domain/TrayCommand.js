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

	static action = { type: 'string', positional: true, default: 'render', help: 'Action: render, set-status, open-antigravity, open-log' }
	static file = { type: 'string', default: 'todo.md', help: 'Target markdown file' }
	static status = { type: 'string', default: '', help: 'New status: todo, work, done, pause, fail' }
	static target = { type: 'string', default: '', help: 'Task target title or index' }
	static project = { type: 'string', default: '', help: 'Project key for open-antigravity' }
	static binPath = { type: 'string', default: '', help: 'Explicit binary path' }
	static binMode = { type: 'string', default: 'bin', help: 'Invocation mode: bin | node' }
	static slotsDir = { type: 'string', default: '.nan0release/slots', help: 'Directory with isolated parallel slot state files' }

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
		/** @type {string} */ this.slotsDir
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * Load isolated parallel slot telemetry records from slotsDir.
	 * @returns {Promise<Record<string, any>[]>}
	 */
	async loadSlots() {
		if (!this.$db || typeof this.$db.listDir !== 'function') return []
		const entries = await this.$db.listDir(this.slotsDir).catch(() => [])
		if (!Array.isArray(entries)) return []
		const slots = []
		for (const entry of entries) {
			const name = entry.name || (entry.path || '').split('/').pop() || ''
			if (!name.endsWith('.json')) continue
			const path = entry.path ? entry.path.replace(/^\.\//, '') : `${this.slotsDir}/${name}`
			const raw = await this.$db.loadDocument(path, null).catch(() => null)
			if (!raw) continue
			try {
				const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
				if (parsed && typeof parsed === 'object') slots.push(parsed)
			} catch {}
		}
		return slots
	}

	/**
	 * Merge parallel slot telemetry into loaded tasks without mutating markdown files.
	 * @param {import('./Task/TaskModel.js').TaskModel[]} tasks
	 * @param {Record<string, any>[]} slots
	 * @param {ProjectsMap} projectsMap
	 */
	applySlots(tasks, slots, projectsMap) {
		for (const task of tasks) {
			if (!task.project && projectsMap) {
				task.project = projectsMap.resolveProject(task, task.domain)
			}
			const match = slots.find((s) => s.target && task.title.toLowerCase().includes(String(s.target).toLowerCase()))
			if (!match) continue
			task.agent = String(match.agent ?? task.agent ?? '')
			task.model = String(match.model ?? task.model ?? '')
			task.tokensIn = Math.max(0, Number(match.tokensIn ?? task.tokensIn) || 0)
			task.tokensOut = Math.max(0, Number(match.tokensOut ?? task.tokensOut) || 0)
			task.costUsd = Math.max(0, Number(match.costUsd ?? task.costUsd) || 0)
			task.step = String(match.step ?? task.step ?? '')
			task.gate = String(match.gate ?? task.gate ?? '')
			task.logPath = String(match.logPath ?? task.logPath ?? '')
		}
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

		if (this.action === 'open-log') {
			const res = await this.$system.openLog(this.file)
			yield show(`Opened log: ${this.file}`, 'success')
			return result(res)
		}

		if (this.action === 'set-status') {
			const res = await this.handleSetStatus()
			yield show(res.ok ? `Updated: ${res.updatedFiles.join(', ')}` : `Task not found: ${this.target}`, res.ok ? 'success' : 'warn')
			return result(res)
		}

		const slots = await this.loadSlots()
		const today = await this.loadTasksFrom(this.file)
		const pool = await this.loadTasksFrom('pool.md')
		const future = await this.loadTasksFrom('future.md')
		this.applySlots(today, slots, projectsMap)
		this.applySlots(pool, slots, projectsMap)
		this.applySlots(future, slots, projectsMap)

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
