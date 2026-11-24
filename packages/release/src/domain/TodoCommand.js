import { ModelAsApp } from '@nan0web/ui-cli'
import { show, result } from '@nan0web/ui'
import { Markdown, MDListItem, MDTable, MDTableRow } from '@nan0web/markdown'
import { TaskModel } from './Task/TaskModel.js'
import { PriorityEvaluator } from './Task/PriorityEvaluator.js'
import { MarkdownRoundTripAuditor } from './Task/MarkdownRoundTripAuditor.js'

const splitTableRow = (raw) =>
	String(raw ?? '')
		.trim()
		.split('|')
		.slice(1, -1)
		.map((c) => c.trim())

const joinTableRow = (cells) => `| ${cells.join(' | ')} |`

const cleanHeader = (h) => String(h ?? '').replace(/\$+/g, '').trim().toLowerCase()

const parseNum = (val) => {
	const n = Number(String(val ?? '').replace(',', '.').trim())
	return Number.isFinite(n) ? n : undefined
}

/**
 * TodoCommand (ModelAsApp)
 * Deterministic CLI Controller for release tasks (MDTaskList & MDTable).
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

	static format = { type: 'string', default: 'cli', help: 'Output format: cli, json, md, text' }
	static file = { type: 'string', help: 'Path to markdown file with tasks' }
	static done = { type: 'string', help: 'Mark task as done [x]' }
	static undo = { type: 'string', help: 'Mark task as undone [ ]' }
	static status = { type: 'string', help: 'Set task status: todo, work, done, pause, fail' }

	/**
	 * @param {Partial<TodoCommand>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.format = data.format ?? 'cli'
		/** @type {string} */ this.file = data.file ?? ''
		/** @type {string} */ this.done = data.done ?? ''
		/** @type {string} */ this.undo = data.undo ?? ''
		/** @type {string} */ this.status = data.status ?? ''
	}

	/**
	 * @returns {Promise<string>}
	 */
	async resolveFile() {
		if (this.file) return this.file
		for (const cand of ['task.md', 'release.md', 'releases/task.md']) {
			const stat = await this.$db.stat(cand).catch(() => null)
			if (stat) return cand
		}
		return 'task.md'
	}

	/**
	 * Extract tasks from Markdown AST (both MDListItem and MDTable).
	 * @param {Markdown} ast
	 * @param {string} [filePath='']
	 * @param {{ evaluator?: import('./Task/PriorityEvaluator.js').PriorityEvaluatorFn }} [options={}]
	 * @returns {TaskModel[]}
	 */
	static extractTasks(ast, filePath = '', options = {}) {
		const tasks = []
		let rowBuffer = []
		const flushRows = () => {
			if (rowBuffer.length >= 3) {
				tasks.push(...TodoCommand.extractTableTasks(/** @type {any} */ ({ children: rowBuffer }), filePath, options.evaluator))
			}
			rowBuffer = []
		}
		const walk = (el) => {
			if (el instanceof MDTableRow) {
				rowBuffer.push(el)
				return
			}
			flushRows()
			if (el instanceof MDListItem && el.status !== null && el.status !== undefined) {
				const fullText = String(el.content ?? '')
				tasks.push(
					new TaskModel({
						title: TaskModel.cleanTitle(fullText),
						fullText,
						status: /** @type {any} */ (el.status),
						kind: 'checkbox',
						badges: el.badges,
						filePath,
						lineIndex: tasks.length + 1,
					}),
				)
			} else if (el instanceof MDTable || el.constructor?.name === 'MDTable') {
				tasks.push(...TodoCommand.extractTableTasks(el, filePath, options.evaluator))
				return
			} else if (typeof el.content === 'string' && el.content.trim().startsWith('|') && el.content.includes('\n|')) {
				tasks.push(...TodoCommand.extractTableTasks(/** @type {any} */ (el), filePath, options.evaluator))
				return
			}
			if (el.children?.length) el.children.forEach(walk)
		}
		ast.document?.children?.forEach(walk)
		flushRows()
		return tasks
	}

	/**
	 * @param {MDTable} table
	 * @param {string} filePath
	 * @param {import('./Task/PriorityEvaluator.js').PriorityEvaluatorFn} [evaluator]
	 * @returns {TaskModel[]}
	 */
	static extractTableTasks(table, filePath, evaluator) {
		const rawRows = (table.children || []).filter((r) => r instanceof MDTableRow)
		const rowStrings = rawRows.length >= 3 ? rawRows.map((r) => r.content) : String(table.content || '').split('\n').filter((l) => l.trim().startsWith('|'))
		if (rowStrings.length < 3) return []
		const headers = splitTableRow(rowStrings[0]).map(cleanHeader)
		const idx = {
			title: headers.findIndex((h) => h.includes('задача') || h.includes('task') || h.includes('title')),
			domain: headers.findIndex((h) => h.includes('домен') || h.includes('domain')),
			status: headers.findIndex((h) => h.includes('статус') || h.includes('status')),
			p: headers.findIndex((h) => h.startsWith('p(') || h === 'p'),
		}
		if (idx.title === -1 || idx.status === -1) return []

		const metricCols = ['v', 'u', 'c', 'l', 'f', 'd', 's']
		return rowStrings.slice(2).map((rowStr, i) => {
			const cells = splitTableRow(rowStr)
			const fullText = cells[idx.title] ?? ''
			const domain = idx.domain >= 0 ? cells[idx.domain] ?? '' : ''
			const status = TaskModel.symbolToStatus(cells[idx.status] ?? '')
			const metrics = {}
			headers.forEach((h, cIdx) => {
				if (metricCols.includes(h)) {
					const num = parseNum(cells[cIdx])
					if (num !== undefined) metrics[h.toUpperCase()] = num
				}
			})
			const parsedP = idx.p >= 0 ? parseNum(cells[idx.p]) : undefined
			const priorityScore = parsedP ?? TaskModel.calculatePriority({ metrics }, evaluator)
			return new TaskModel({
				title: TaskModel.cleanTitle(fullText),
				fullText,
				status,
				kind: 'table',
				domain,
				metrics,
				priorityScore,
				filePath,
				lineIndex: i + 1,
			})
		})
	}

	/**
	 * Mutate task status in Markdown AST (MDListItem or MDTableRow).
	 * @param {Markdown} ast
	 * @param {string | number | boolean} targetTitleOrBadge
	 * @param {'todo' | 'work' | 'done' | 'pause' | 'fail'} newStatus
	 * @returns {boolean}
	 */
	static mutateTask(ast, targetTitleOrBadge, newStatus) {
		if (targetTitleOrBadge === undefined || targetTitleOrBadge === null) return false
		const targetStr = String(targetTitleOrBadge).trim()
		const targetLower = targetStr.toLowerCase()
		const targetIdx = Number(targetStr)
		const isIdx = !isNaN(targetIdx) && Number.isInteger(targetIdx) && targetIdx >= 1
		let currentIndex = 0
		let mutated = false

		const matchesText = (text, badges = {}) => {
			if (isIdx) return currentIndex === targetIdx
			if (!targetLower) return false
			if (text.trim().toLowerCase().includes(targetLower)) return true
			if (TaskModel.cleanTitle(text).toLowerCase().includes(targetLower)) return true
			return (
				Object.values(badges).some((v) => String(v).toLowerCase() === targetLower) ||
				Object.keys(badges).some((k) => k.toLowerCase() === targetLower)
			)
		}

		let rowBuffer = []
		const flushRows = () => {
			if (rowBuffer.length >= 3) {
				const rowStrings = rowBuffer.map((r) => r.content)
				const headers = splitTableRow(rowStrings[0]).map(cleanHeader)
				const tCol = headers.findIndex((h) => h.includes('задача') || h.includes('task') || h.includes('title'))
				const sCol = headers.findIndex((h) => h.includes('статус') || h.includes('status'))
				if (tCol >= 0 && sCol >= 0) {
					for (let i = 2; i < rowBuffer.length; i++) {
						currentIndex++
						const cells = splitTableRow(rowBuffer[i].content)
						if (matchesText(cells[tCol] ?? '')) {
							cells[sCol] = TaskModel.statusToTableSymbol(newStatus)
							rowBuffer[i].content = joinTableRow(cells)
							mutated = true
						}
					}
				}
			}
			rowBuffer = []
		}
		const walk = (el) => {
			if (el instanceof MDTableRow) {
				rowBuffer.push(el)
				return
			}
			flushRows()
			if (el instanceof MDListItem && el.status !== null) {
				currentIndex++
				if (matchesText(el.content, el.badges)) {
					el.status = /** @type {any} */ (newStatus)
					mutated = true
				}
			} else if (
				el instanceof MDTable ||
				el.constructor?.name === 'MDTable' ||
				(typeof el.content === 'string' && el.content.trim().startsWith('|') && el.content.includes('\n|'))
			) {
				const rawRows = (el.children || []).filter((r) => r instanceof MDTableRow)
				const rowStrings = rawRows.length >= 3 ? rawRows.map((r) => r.content) : String(el.content || '').split('\n').filter((l) => l.trim().startsWith('|'))
				if (rowStrings.length >= 3) {
					const headers = splitTableRow(rowStrings[0]).map(cleanHeader)
					const tCol = headers.findIndex((h) => h.includes('задача') || h.includes('task') || h.includes('title'))
					const sCol = headers.findIndex((h) => h.includes('статус') || h.includes('status'))
					if (tCol >= 0 && sCol >= 0) {
						for (let i = 2; i < rowStrings.length; i++) {
							currentIndex++
							const cells = splitTableRow(rowStrings[i])
							if (matchesText(cells[tCol] ?? '')) {
								cells[sCol] = TaskModel.statusToTableSymbol(newStatus)
								rowStrings[i] = joinTableRow(cells)
								if (rawRows[i]) rawRows[i].content = rowStrings[i]
								mutated = true
							}
						}
						if (mutated) el.content = rowStrings.join('\n')
					}
				}
				return
			}
			if (el.children?.length) el.children.forEach(walk)
		}
		ast.document?.children?.forEach(walk)
		flushRows()
		return mutated
	}

	/**
	 * @param {TaskModel[]} tasks
	 * @param {string} [format='cli']
	 * @returns {string}
	 */
	static formatTasks(tasks, format = 'cli') {
		if (format === 'json') {
			return JSON.stringify(
				tasks.map((t) => ({
					title: t.title,
					fullText: t.fullText,
					status: t.status,
					kind: t.kind,
					domain: t.domain,
					priorityScore: t.priorityScore,
					badges: t.badges,
					filePath: t.filePath,
					lineIndex: t.lineIndex,
				})),
				null,
				2,
			)
		}
		if (format === 'md' || format === 'text') {
			return tasks
				.map((t) => {
					const mark = TaskModel.statusToCheckboxMark(t.status)
					const badges = Object.entries(t.badges || {}).map(([k, v]) => `[${k}:${v}]`).join(' ')
					return format === 'md' ? `- [${mark}] ${t.title}${badges ? ' ' + badges : ''}` : `[${mark}] ${t.title}`
				})
				.join('\n')
		}
		if (tasks.length === 0) return 'No tasks found.'
		const cliMarks = { done: '✔', work: '▶', fail: '✖', pause: '⏸️', todo: '○' }
		return tasks
			.map((t, idx) => {
				const mark = cliMarks[t.status] ?? '○'
				const badges = Object.entries(t.badges || {}).map(([k, v]) => `(${k}:${v})`).join(' ')
				return `${idx + 1}. [${mark}] ${t.title} ${badges}`.trim()
			})
			.join('\n')
	}

	async *run() {
		const filePath = await this.resolveFile()
		const doc = await this.$db.loadDocument(filePath)
		if (!doc) {
			yield show(`File not found: ${filePath}`, 'error')
			return result({ status: 'error', reason: 'file_not_found' })
		}

		const content = typeof doc === 'string' ? doc : String(doc)
		const ast = doc instanceof Markdown ? doc : new Markdown(content)
		const hasDone = this.done !== undefined && this.done !== '' && this.done !== false
		const hasUndo = this.undo !== undefined && this.undo !== '' && this.undo !== false
		const hasStatus = Boolean(this.status)

		if (hasDone || hasUndo || hasStatus) {
			const target = hasDone ? this.done : hasUndo ? this.undo : this.done || this.undo
			const newStatus = hasDone ? 'done' : hasUndo ? 'todo' : /** @type {any} */ (this.status)
			if (!target || target === true) {
				yield show('Target is required for status mutation', 'error')
				return result({ status: 'error', reason: 'target_missing' })
			}
			if (!TodoCommand.mutateTask(ast, target, newStatus)) {
				yield show(`Task "${target}" not found in ${filePath}`, 'warn')
				return result({ status: 'warn', reason: 'task_not_found' })
			}
			const serialized = String(ast)
			const stripStatus = (s) =>
				s.replace(/- \[[ xX>\-~]\]/g, '- [ ]').replace(/\|\s*(⬜|▶|✅|⏸️?|❌)\s*\|/g, '| ⬜ |')
			const { matches, diff } = MarkdownRoundTripAuditor.compare(stripStatus(content), stripStatus(serialized))
			if (!matches) {
				yield show(`Zero-Drift Protection Failed: ${diff}`, 'error')
				return result({ status: 'failed', reason: 'drift_detected', diff })
			}
			await this.$db.saveDocument(filePath, serialized)
			yield show(`Successfully updated task in ${filePath}`, 'success')
			return result({ status: 'ok', filePath })
		}

		const tasks = TodoCommand.extractTasks(ast, filePath)
		yield show(TodoCommand.formatTasks(tasks, this.format))
		return result({ status: 'ok', tasks })
	}
}

export { TaskModel, MarkdownRoundTripAuditor }
export default TodoCommand
