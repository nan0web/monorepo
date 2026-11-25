import { ModelAsApp, progress, show, result } from '@nan0web/ui'
import { SystemAdapter } from '../adapters/SystemAdapter.js'

/**
 * BatchCommand (ModelAsApp)
 * Detects targetFiles overlaps and dispatches up to 20 parallel tasks into isolated git worktrees.
 */
export class BatchCommand extends ModelAsApp {
	static alias = 'batch'

	static UI = {
		title: 'Parallel Batch & Worktree Dispatcher',
		conflictError: 'Detected targetFiles conflicts across parallel tasks',
		dispatched: 'Dispatched {count} parallel worktree slots',
	}

	static tasks = { type: 'array', default: () => [], help: 'Tasks to dispatch ({ id, targetFiles, branch })' }
	static worktreeRoot = { type: 'string', default: '.worktrees', help: 'Root directory for git worktrees' }
	static maxParallel = { type: 'number', default: 20, help: 'Maximum parallel slots (10-20)' }
	static dryRun = { type: 'boolean', default: false, help: 'Check conflicts without creating worktrees' }

	/**
	 * @param {Partial<BatchCommand>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: any }} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Array<{ id?: string, target?: string, targetFiles?: string[], branch?: string }>} */
		this.tasks = Array.isArray(data.tasks) ? [...data.tasks] : []
		/** @type {string} */ this.worktreeRoot
		/** @type {number} */ this.maxParallel = Math.max(1, Number(data.maxParallel ?? 20) || 20)
		/** @type {boolean} */ this.dryRun = Boolean(data.dryRun)
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * Detect overlapping targetFiles across a batch of tasks.
	 * @param {Array<{ id?: string, title?: string, targetFiles?: string[] }>} tasks
	 * @returns {Array<{ file: string, tasks: string[] }>}
	 */
	static detectConflicts(tasks = []) {
		/** @type {Map<string, string[]>} */
		const ownership = new Map()
		tasks.forEach((task, idx) => {
			const id = String(task.id || task.title || `slot-${idx + 1}`)
			const files = Array.isArray(task.targetFiles) ? task.targetFiles : []
			for (const rawFile of files) {
				const file = String(rawFile).trim()
				if (!file) continue
				const owners = ownership.get(file) || []
				if (!owners.includes(id)) owners.push(id)
				ownership.set(file, owners)
			}
		})
		return [...ownership.entries()]
			.filter(([, owners]) => owners.length > 1)
			.map(([file, owners]) => ({ file, tasks: owners }))
	}

	async *run() {
		const conflicts = BatchCommand.detectConflicts(this.tasks)
		if (conflicts.length > 0) {
			const summary = conflicts.map((c) => `${c.file} (${c.tasks.join(', ')})`).join('; ')
			yield show(`${BatchCommand.UI.conflictError}: ${summary}`, 'error')
			return result({ ok: false, reason: 'target_files_conflict', conflicts, dispatched: [] })
		}

		const batch = this.tasks.slice(0, this.maxParallel)
		const dispatched = []
		for (let i = 0; i < batch.length; i++) {
			const task = batch[i]
			const id = String(task.id || `slot-${i + 1}`)
			const branch = String(task.branch || `batch/${id}`)
			const worktreePath = `${this.worktreeRoot}/${id}`
			yield progress(`Preparing worktree ${id} (${i + 1}/${batch.length})`)
			if (!this.dryRun) {
				await this.$system.execGit(['worktree', 'add', '-b', branch, worktreePath])
			}
			const slotState = { id, target: task.target || id, branch, worktreePath, status: 'work', step: '0/1', gate: 'pending' }
			if (this.$db) {
				await this.$db.saveDocument(`.nan0release/slots/${id}.json`, JSON.stringify(slotState, null, 2))
			}
			dispatched.push(slotState)
		}

		yield show(BatchCommand.UI.dispatched.replace('{count}', String(dispatched.length)), 'success')
		return result({ ok: true, conflicts: [], dispatched })
	}
}

export default BatchCommand
