import { Model } from '@nan0web/types'
import { PriorityEvaluator } from './PriorityEvaluator.js'

const SYMBOL_TO_STATUS = {
	'⬜': 'todo',
	'○': 'todo',
	' ': 'todo',
	'▶': 'work',
	'>': 'work',
	'✅': 'done',
	'✔': 'done',
	x: 'done',
	X: 'done',
	'⏸️': 'pause',
	'⏸': 'pause',
	'~': 'pause',
	'❌': 'fail',
	'✖': 'fail',
	'-': 'fail',
}

const STATUS_TO_TABLE = {
	todo: '⬜',
	work: '▶',
	done: '✅',
	pause: '⏸️',
	fail: '❌',
}

const STATUS_TO_CHECKBOX = {
	todo: ' ',
	work: '>',
	done: 'x',
	pause: '~',
	fail: '-',
}

/**
 * TaskModel (Model-as-Schema)
 * Represents a single task item parsed from Markdown AST (checkbox or table).
 */
export class TaskModel extends Model {
	static title = { type: 'string', required: true, help: 'Task title' }
	static fullText = { type: 'string', default: '', help: 'Full untruncated task text' }
	static status = { type: 'string', default: 'todo', help: 'Task status: todo, work, done, pause, fail' }
	static kind = { type: 'string', default: 'checkbox', help: 'Source format: checkbox or table' }
	static domain = { type: 'string', default: '', help: 'Task domain' }
	static hashtags = { type: 'array', default: [], help: 'Extracted hashtags' }
	static project = { type: 'string', default: '', help: 'Resolved project key' }
	static date = { type: 'string', default: '', help: 'Optional date YYYY-MM-DD' }
	static badges = { type: 'object', default: {}, help: 'Key-value badges extracted from task' }
	static metrics = { type: 'object', default: {}, help: 'Numeric metrics (V, U, C, L, F, D, S)' }
	static priorityScore = { type: 'number', default: 0, help: 'Calculated priority P(x)' }
	static filePath = { type: 'string', default: '', help: 'Source file path' }
	static lineIndex = { type: 'number', default: 0, help: 'Line index in file' }
	static agent = { type: 'string', default: '', help: 'Assigned agent identifier' }
	static model = { type: 'string', default: '', help: 'Active LLM model name' }
	static tokensIn = { type: 'number', default: 0, help: 'Input tokens consumed' }
	static tokensOut = { type: 'number', default: 0, help: 'Output tokens generated' }
	static costUsd = { type: 'number', default: 0, help: 'Estimated cost in USD' }
	static step = { type: 'string', default: '', help: 'Current progress step (e.g. 4/7)' }
	static gate = { type: 'string', default: '', help: 'Gate status: pass, fail, pending' }
	static targetFiles = { type: 'array', default: [], help: 'Target files touched by task' }
	static logPath = { type: 'string', default: '', help: 'Path to task execution log' }

	/**
	 * @param {Partial<TaskModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Task title */ this.title
		/** @type {string} Full untruncated task text */ this.fullText
		if (!this.fullText) this.fullText = this.title
		/** @type {'todo' | 'done' | 'work' | 'pause' | 'fail'} Task status */ this.status
		/** @type {'checkbox' | 'table'} Source format */ this.kind
		/** @type {string} Task domain */ this.domain
		/** @type {string[]} Extracted hashtags */
		this.hashtags = Array.isArray(data.hashtags) ? [...data.hashtags] : TaskModel.extractHashtags(this.fullText)
		/** @type {string} Resolved project key */ this.project
		/** @type {string} Optional date YYYY-MM-DD */ this.date
		/** @type {Record<string, string>} Key-value badges */ this.badges
		/** @type {Record<string, number>} Numeric metrics */ this.metrics
		/** @type {number} Calculated priority P(x) */
		this.priorityScore = Number(data.priorityScore ?? 0)
		/** @type {string} Source file path */ this.filePath
		/** @type {number} Line index in file */ this.lineIndex
		/** @type {string} Assigned agent identifier */ this.agent = String(data.agent ?? '')
		/** @type {string} Active LLM model name */ this.model = String(data.model ?? '')
		/** @type {number} Input tokens consumed */ this.tokensIn = Math.max(0, Number(data.tokensIn ?? 0) || 0)
		/** @type {number} Output tokens generated */ this.tokensOut = Math.max(0, Number(data.tokensOut ?? 0) || 0)
		/** @type {number} Estimated cost in USD */ this.costUsd = Math.max(0, Number(data.costUsd ?? 0) || 0)
		/** @type {string} Current progress step */ this.step = String(data.step ?? '')
		/** @type {string} Gate status */ this.gate = String(data.gate ?? '')
		/** @type {string[]} Target files */
		this.targetFiles = Array.isArray(data.targetFiles) ? [...data.targetFiles] : []
		/** @type {string} Path to execution log */ this.logPath = String(data.logPath ?? '')
	}

	/**
	 * Compute total tokens (input + output) for a task.
	 * @param {Partial<TaskModel>} task
	 * @returns {number}
	 */
	static totalTokens(task) {
		return Math.max(0, Number(task?.tokensIn ?? 0) || 0) + Math.max(0, Number(task?.tokensOut ?? 0) || 0)
	}

	/**
	 * Format token count into compact human-readable string (e.g. 640k tok).
	 * @param {number} count
	 * @returns {string}
	 */
	static formatTokens(count) {
		const n = Math.max(0, Number(count) || 0)
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M tok`
		if (n >= 1_000) return `${Math.round(n / 1_000)}k tok`
		return `${Math.round(n)} tok`
	}

	/**
	 * Format USD cost with 2 decimal places (e.g. $2.15).
	 * @param {number} usd
	 * @returns {string}
	 */
	static formatCost(usd) {
		const n = Math.max(0, Number(usd) || 0)
		return `$${n.toFixed(2)}`
	}

	/**
	 * Convert table or checkbox symbol to normalized status.
	 * @param {string} symbol
	 * @returns {'todo' | 'work' | 'done' | 'pause' | 'fail'}
	 */
	static symbolToStatus(symbol) {
		const key = String(symbol ?? '').trim()
		return /** @type {any} */ (SYMBOL_TO_STATUS[key] ?? 'todo')
	}

	/**
	 * Convert status to table emoji symbol.
	 * @param {string} status
	 * @returns {string}
	 */
	static statusToTableSymbol(status) {
		return STATUS_TO_TABLE[status] ?? '⬜'
	}

	/**
	 * Convert status to markdown checkbox mark.
	 * @param {string} status
	 * @returns {string}
	 */
	static statusToCheckboxMark(status) {
		return STATUS_TO_CHECKBOX[status] ?? ' '
	}

	/**
	 * Calculate task priority via PriorityEvaluator contract.
	 * @param {TaskModel | Record<string, any>} taskOrMetrics
	 * @param {import('./PriorityEvaluator.js').PriorityEvaluatorFn} [evaluator]
	 * @param {{ tasks?: any[], date?: string }} [context]
	 * @returns {number}
	 */
	static calculatePriority(taskOrMetrics, evaluator = PriorityEvaluator.table, context = {}) {
		return PriorityEvaluator.evaluate(taskOrMetrics, evaluator, context)
	}

	/**
	 * Extract #hashtags from text.
	 * @param {string} text
	 * @returns {string[]}
	 */
	static extractHashtags(text) {
		const matches = String(text ?? '').match(/#[\p{L}\p{N}_-]+/gu) || []
		return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))]
	}

	/**
	 * Clean raw task text and optionally truncate.
	 * @param {string} rawBody
	 * @param {number} [maxLen=0]
	 * @returns {string}
	 */
	static cleanTitle(rawBody, maxLen = 0) {
		const cleaned = String(rawBody ?? '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/\*\*([^*]+)\*\*/g, '$1')
			.replace(/__([^_]+)__/g, '$1')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, '$1$2')
			.replace(/\s+/g, ' ')
			.trim()
		if (maxLen > 0 && cleaned.length > maxLen) {
			return `${cleaned.slice(0, maxLen - 1)}…`
		}
		return cleaned
	}
}

export default TaskModel
