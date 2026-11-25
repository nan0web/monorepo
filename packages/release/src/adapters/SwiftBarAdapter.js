import { TaskModel } from '../domain/Task/TaskModel.js'

/**
 * @typedef {object} SwiftBarState
 * @property {TaskModel[]} [today] - Today's tasks.
 * @property {TaskModel[]} [pool] - Priority pool tasks.
 * @property {TaskModel[]} [future] - Scheduled future tasks.
 * @property {TaskModel[]} [pendingOld] - Pending tasks from previous days.
 * @property {Record<string, any>} [projects] - Loaded projects map entries.
 * @property {string} [binPath] - Explicit binary path override.
 * @property {string} [binMode] - Invocation mode: 'bin' | 'node'.
 * @property {(tpl: string, vars?: Record<string, unknown>) => string} [t] - Optional i18n translator.
 */

/**
 * Default template translator when no i18n function is provided.
 * @param {string} tpl
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
function defaultT(tpl, vars = {}) {
	return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`))
}

/**
 * SwiftBarAdapter formats task state into SwiftBar/Argos menu lines.
 */
export class SwiftBarAdapter {
	static UI = {
		sectionWork: '▶ IN PROGRESS',
		sectionToday: '📅 TODAY',
		sectionPool: '⚡ TOP-12 PRIORITY (POOL)',
		sectionPending: '⏳ PENDING TASKS',
		sectionFuture: '🗓 SCHEDULED TASKS',
		sectionProjects: '🚀 OPEN PROJECT IN ANTIGRAVITY',
		openWeb: '🌐 Open todo.test',
		actions: {
			work: '▶ В роботу',
			done: '✅ Виконано',
			pause: '⏸️ Пауза',
			todo: '⬜ В чергу',
		},
	}

	static STATUS_TRANSITIONS = {
		done: ['todo'],
		todo: ['work', 'done', 'pause'],
		work: ['done', 'pause', 'todo'],
		pause: ['work', 'done', 'todo'],
		fail: ['todo', 'work'],
	}

	/**
	 * Escape pipe characters so each SwiftBar line has at most one "|".
	 * @param {string} value
	 * @returns {string}
	 */
	static sanitizePipe(value) {
		return String(value ?? '').replace(/\|/g, '/')
	}

	/**
	 * Wrap text into lines up to maxLen characters.
	 * @param {string} text
	 * @param {number} [maxLen=65]
	 * @returns {string[]}
	 */
	static wrapText(text, maxLen = 65) {
		const words = String(text ?? '').trim().split(/\s+/).filter(Boolean)
		if (words.length === 0) return []
		const lines = []
		let current = ''
		for (const word of words) {
			if (!current) {
				current = word
			} else if (current.length + 1 + word.length <= maxLen) {
				current += ` ${word}`
			} else {
				lines.push(current)
				current = word
			}
		}
		if (current) lines.push(current)
		return lines
	}

	/**
	 * Format a single SwiftBar menu line with optional parameters.
	 * @param {string} label
	 * @param {string} [params='']
	 * @returns {string}
	 */
	static formatLine(label, params = '') {
		const safeLabel = SwiftBarAdapter.sanitizePipe(label)
		const safeParams = SwiftBarAdapter.sanitizePipe(params).trim()
		return safeParams ? `${safeLabel} | ${safeParams}` : safeLabel
	}

	/**
	 * Quote argument if it contains whitespace so SwiftBar passes it intact.
	 * @param {string} arg
	 * @returns {string}
	 */
	static quoteArg(arg) {
		const str = String(arg ?? '')
		return /\s/.test(str) ? `"${str.replace(/"/g, '\\"')}"` : str
	}

	/**
	 * Build SwiftBar bash command parameters using bin or node invocation mode.
	 * @param {SwiftBarState} state
	 * @param {string[]} args
	 * @returns {string}
	 */
	static buildCmd(state, args) {
		const binPath = state.binPath || 'nan0release'
		const binMode = state.binMode || 'bin'
		const fullArgs = binMode === 'node' ? [binPath, ...args] : args
		const bashBin = binMode === 'node' ? 'node' : binPath
		const params = fullArgs.map((arg, idx) => `param${idx + 1}=${SwiftBarAdapter.quoteArg(arg)}`).join(' ')
		return `bash=${SwiftBarAdapter.quoteArg(bashBin)} ${params} terminal=false refresh=true`
	}

	/**
	 * Render top menu bar header line with completion/progress summary and telemetry.
	 * @param {TaskModel[]} tasks
	 * @returns {string}
	 */
	static renderHeader(tasks) {
		const total = tasks.length
		if (total === 0) return SwiftBarAdapter.formatLine('✓ 0', 'sfimage=checkmark.circle')
		const done = tasks.filter((t) => t.status === 'done').length
		const work = tasks.filter((t) => t.status === 'work').length
		const todo = tasks.filter((t) => t.status === 'todo').length
		const pct = (n) => Math.round((n / total) * 100)
		const totalTok = tasks.reduce((sum, t) => sum + TaskModel.totalTokens(t), 0)
		const totalCost = tasks.reduce((sum, t) => sum + (Number(t.costUsd) || 0), 0)
		const telem = totalTok > 0 || totalCost > 0
			? ` • ${TaskModel.formatCost(totalCost)} • ${TaskModel.formatTokens(totalTok)}`
			: ''
		if (done === total) return SwiftBarAdapter.formatLine(`✓ 100%${telem}`, 'color=#34c759')
		if (work > 0) return SwiftBarAdapter.formatLine(`▶ ${work}/${total} (${pct(work)}%)${telem}`, 'color=#0a84ff')
		return SwiftBarAdapter.formatLine(`○ ${todo}/${total} (${pct(todo)}%)${telem}`)
	}

	/**
	 * Render telemetry and quick-open sub-items for a task.
	 * @param {TaskModel} task
	 * @param {SwiftBarState} state
	 * @returns {string[]}
	 */
	static renderTaskTelemetry(task, state) {
		const lines = []
		const totalTok = TaskModel.totalTokens(task)
		const hasTelemetry = Boolean(task.agent || task.model || task.step || task.gate || totalTok > 0 || task.costUsd > 0)
		if (hasTelemetry) {
			const parts = [
				task.agent ? `🤖 ${task.agent}` : '',
				task.model || '',
				task.step ? `step ${task.step}` : '',
				task.gate ? `gate:${task.gate}` : '',
				task.costUsd > 0 ? TaskModel.formatCost(task.costUsd) : '',
				totalTok > 0 ? TaskModel.formatTokens(totalTok) : '',
			].filter(Boolean)
			lines.push(SwiftBarAdapter.formatLine(`--${parts.join(' • ')}`, 'size=11 color=#8e8e93'))
		}
		if (task.logPath) {
			const cmd = SwiftBarAdapter.buildCmd(state, ['tray', 'open-log', `--file=${task.logPath}`])
			lines.push(SwiftBarAdapter.formatLine('--📄 Open Log', cmd))
		}
		if (task.project) {
			const cmd = SwiftBarAdapter.buildCmd(state, ['tray', 'open-antigravity', `--project=${task.project}`])
			lines.push(SwiftBarAdapter.formatLine(`--🚀 Open IDE (${task.project})`, cmd))
		}
		return lines
	}

	/**
	 * Render a single task item with wrapped fullText, telemetry, and status actions.
	 * @param {TaskModel} task
	 * @param {SwiftBarState} state
	 * @returns {string[]}
	 */
	static renderTaskItem(task, state) {
		const t = state.t || defaultT
		const sym = TaskModel.statusToTableSymbol(task.status)
		const p = task.priorityScore ? ` [${task.priorityScore}]` : ''
		const title = TaskModel.cleanTitle(task.title, 48)
		const lines = [SwiftBarAdapter.formatLine(`${sym} ${title}${p}`)]
		const cleanFull = TaskModel.cleanTitle(task.fullText || task.title)
		for (const w of SwiftBarAdapter.wrapText(cleanFull, 65)) {
			lines.push(SwiftBarAdapter.formatLine(`--${w}`, 'size=12 color=#e5e5e5'))
		}
		lines.push(...SwiftBarAdapter.renderTaskTelemetry(task, state))
		const target = task.title.slice(0, 40)
		const transitions = SwiftBarAdapter.STATUS_TRANSITIONS[task.status] || ['work', 'done', 'pause', 'todo']
		for (const st of transitions) {
			const label = `--${t(SwiftBarAdapter.UI.actions[st] || st)}`
			const cmd = SwiftBarAdapter.buildCmd(state, ['tray', 'set-status', `--file=${task.filePath || 'todo.md'}`, `--status=${st}`, `--target=${target}`])
			lines.push(SwiftBarAdapter.formatLine(label, cmd))
		}
		return lines
	}

	/**
	 * Render complete SwiftBar menu output for all task sections and projects.
	 * @param {SwiftBarState} [state={}]
	 * @returns {string}
	 */
	static render(state = {}) {
		const { today = [], pool = [], future = [], pendingOld = [], projects = {}, t = defaultT } = state
		const UI = SwiftBarAdapter.UI
		const lines = [SwiftBarAdapter.renderHeader(today), '---']

		const renderSection = (heading, items) => {
			if (!items.length) return
			lines.push(SwiftBarAdapter.formatLine(t(heading), 'font=bold'))
			items.forEach((item) => lines.push(...SwiftBarAdapter.renderTaskItem(item, state)))
			lines.push('---')
		}

		renderSection(UI.sectionWork, today.filter((item) => item.status === 'work'))
		renderSection(UI.sectionToday, today.filter((item) => item.status !== 'work'))
		renderSection(UI.sectionPool, pool.slice(0, 12))
		renderSection(UI.sectionPending, pendingOld)
		renderSection(UI.sectionFuture, future)

		const projKeys = Object.keys(projects)
		if (projKeys.length) {
			lines.push(SwiftBarAdapter.formatLine(t(UI.sectionProjects), 'font=bold'))
			for (const key of projKeys) {
				lines.push(SwiftBarAdapter.formatLine(`--${key}`, SwiftBarAdapter.buildCmd(state, ['tray', 'open-antigravity', `--project=${key}`])))
			}
			lines.push('---')
		}

		lines.push(SwiftBarAdapter.formatLine(t(UI.openWeb), 'href=https://todo.test'))
		return lines.join('\n')
	}
}

export default SwiftBarAdapter
