import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, result } from '@nan0web/ui'
import { Markdown, MDListItem, MDTaskList, MDList } from '@nan0web/markdown'
import { TaskModel } from './Task/TaskModel.js'
import { MarkdownRoundTripAuditor } from './Task/MarkdownRoundTripAuditor.js'

/**
 * TodoCommand (ModelAsApp)
 * Deterministic CLI Controller for release tasks.
 * Supports:
 * - Formats: --format=cli|json|md|text
 * - Filters/Files: --file=<path>
 * - Mutations: --done="<id|title>", --undo="<id|title>"
 */
export class TodoCommand extends ModelAsApp {
	static alias = 'todo'

	static UI = {
		title: 'PM-as-Code Task AST Controller',
		scan_start: 'Scanning tasks in {file}...',
		mutation_success: 'Successfully updated task status in {file}',
		task_not_found: 'Task "{target}" not found in {file}',
		drift_error: 'Zero-Drift Protection: RoundTrip audit failed. Mutation cancelled.',
	}

	static format = {
		type: 'string',
		default: 'cli',
		help: 'Output format: cli, json, md, text',
	}

	static file = {
		type: 'string',
		help: 'Path to markdown file with tasks',
	}

	static done = {
		type: 'string',
		help: 'Mark task as done [x]',
	}

	static undo = {
		type: 'string',
		help: 'Mark task as undone [ ]',
	}

	/**
	 * @param {Partial<TodoCommand>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.format = data.format ?? 'cli'
		/** @type {string} */
		this.file = data.file ?? ''
		/** @type {string} */
		this.done = data.done ?? ''
		/** @type {string} */
		this.undo = data.undo ?? ''
	}

	/**
	 * Find default task file if not specified.
	 * @returns {Promise<string>}
	 */
	async resolveFile() {
		if (this.file) return this.file
		// Check for task.md or release.md in releases/
		const candidates = [
			'task.md',
			'release.md',
			'releases/task.md',
		]
		for (const cand of candidates) {
			const stat = await this.$db.stat(cand).catch(() => null)
			if (stat) return cand
		}
		return 'task.md'
	}

	/**
	 * Extract tasks from Markdown AST.
	 * @param {Markdown} ast
	 * @param {string} filePath
	 * @returns {TaskModel[]}
	 */
	static extractTasks(ast, filePath = '') {
		const tasks = []
		let line = 1

		const walk = (element) => {
			if (element instanceof MDListItem) {
				if (element.status !== null && element.status !== undefined) {
					tasks.push(
						new TaskModel({
							title: element.content,
							status: element.status,
							badges: element.badges,
							filePath,
							lineIndex: line,
						})
					)
				}
			}
			if (element.children && element.children.length > 0) {
				for (const child of element.children) {
					walk(child)
				}
			}
		}

		if (ast.document?.children) {
			for (const child of ast.document.children) {
				walk(child)
			}
		}

		return tasks
	}

	/**
	 * Mutate task status in Markdown AST.
	 * @param {Markdown} ast
	 * @param {string} targetTitleOrBadge
	 * @param {'done' | 'todo'} newStatus
	 * @returns {boolean} Whether any item was mutated
	 */
	static mutateTask(ast, targetTitleOrBadge, newStatus) {
		let mutated = false
		const targetLower = targetTitleOrBadge.trim().toLowerCase()

		const walk = (element) => {
			if (element instanceof MDListItem && element.status !== null) {
				const titleMatch = element.content.trim().toLowerCase().includes(targetLower)
				const badgeMatch = Object.values(element.badges || {}).some(v => String(v).toLowerCase() === targetLower)
				const keyMatch = Object.keys(element.badges || {}).some(k => k.toLowerCase() === targetLower)
				
				if (titleMatch || badgeMatch || keyMatch) {
					element.status = newStatus
					mutated = true
				}
			}
			if (element.children && element.children.length > 0) {
				for (const child of element.children) {
					walk(child)
				}
			}
		}

		if (ast.document?.children) {
			for (const child of ast.document.children) {
				walk(child)
			}
		}

		return mutated
	}

	/**
	 * Format tasks according to target format.
	 * @param {TaskModel[]} tasks
	 * @param {string} format
	 * @returns {string}
	 */
	static formatTasks(tasks, format = 'cli') {
		switch (format) {
			case 'json':
				return JSON.stringify(tasks.map(t => ({
					title: t.title,
					status: t.status,
					badges: t.badges,
					filePath: t.filePath,
					lineIndex: t.lineIndex,
				})), null, 2)

			case 'md':
				return tasks.map(t => {
					const mark = t.status === 'done' ? 'x' : t.status === 'work' ? '>' : t.status === 'fail' ? '-' : ' '
					const badges = Object.entries(t.badges || {}).map(([k, v]) => `[${k}:${v}]`).join(' ')
					return `- [${mark}] ${t.title}${badges ? ' ' + badges : ''}`
				}).join('\n')

			case 'text':
				return tasks.map(t => {
					const mark = t.status === 'done' ? 'x' : t.status === 'work' ? '>' : t.status === 'fail' ? '-' : ' '
					return `[${mark}] ${t.title}`
				}).join('\n')

			case 'cli':
			default:
				if (tasks.length === 0) return 'No tasks found.'
				return tasks.map((t, idx) => {
					const mark = t.status === 'done' ? '✔' : t.status === 'work' ? '▶' : t.status === 'fail' ? '✖' : '○'
					const badges = Object.entries(t.badges || {}).map(([k, v]) => `(${k}:${v})`).join(' ')
					return `${idx + 1}. [${mark}] ${t.title} ${badges}`.trim()
				}).join('\n')
		}
	}

	/**
	 * Run TodoCommand generator.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { status: string, tasks?: TaskModel[] }, any>}
	 */
	async *run() {
		const filePath = await this.resolveFile()
		const content = await this.$db.loadDocument(filePath)
		if (!content || typeof content !== 'string') {
			yield show(`File not found: ${filePath}`, 'error')
			return result({ status: 'error', reason: 'file_not_found' })
		}

		const ast = new Markdown(content)

		// Check for mutations
		if (this.done || this.undo) {
			const target = this.done || this.undo
			const newStatus = this.done ? 'done' : 'todo'
			const mutated = TodoCommand.mutateTask(ast, target, newStatus)

			if (!mutated) {
				yield show(`Task "${target}" not found in ${filePath}`, 'warn')
				return result({ status: 'warn', reason: 'task_not_found' })
			}

			// Validate with Zero-Drift Auditor
			const serialized = String(ast)
			const expectedDifference = this.done ? '[- ] vs [-x]' : '[-x] vs [- ]'
			// Verify that the only drift is the status markers
			const origCleaned = content.replace(/- \[[ xX>\-]\]/g, '- [ ]')
			const serCleaned = serialized.replace(/- \[[ xX>\-]\]/g, '- [ ]')
			const { matches, diff } = MarkdownRoundTripAuditor.compare(origCleaned, serCleaned)

			if (!matches) {
				yield show(`Zero-Drift Protection Failed: ${diff}`, 'error')
				return result({ status: 'failed', reason: 'drift_detected', diff })
			}

			// Save through polymophic $db
			await this.$db.saveDocument(filePath, serialized)
			yield show(`Successfully updated task in ${filePath}`, 'success')
			return result({ status: 'ok', filePath })
		}

		// Read and format tasks
		const tasks = TodoCommand.extractTasks(ast, filePath)
		const formatted = TodoCommand.formatTasks(tasks, this.format)

		yield show(formatted)
		return result({ status: 'ok', tasks })
	}
}

export { TaskModel, MarkdownRoundTripAuditor }
export default TodoCommand
