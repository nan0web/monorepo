import { Model } from '@nan0web/types'

/**
 * TaskModel (Model-as-Schema)
 * Represents a single task item parsed from Markdown AST.
 */
export class TaskModel extends Model {
	static title = { type: 'string', required: true, help: 'Task title' }
	static status = { type: 'string', default: 'todo', help: 'Task status: todo, done, work, fail' }
	static badges = { type: 'object', default: {}, help: 'Key-value badges extracted from task' }
	static filePath = { type: 'string', default: '', help: 'Source file path' }
	static lineIndex = { type: 'number', default: 0, help: 'Line index in file' }

	/**
	 * @param {Partial<TaskModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.title = data.title ?? ''
		/** @type {'todo' | 'done' | 'work' | 'fail'} */
		this.status = data.status ?? 'todo'
		/** @type {Record<string, string>} */
		this.badges = data.badges ? { ...data.badges } : {}
		/** @type {string} */
		this.filePath = data.filePath ?? ''
		/** @type {number} */
		this.lineIndex = data.lineIndex ?? 0
	}
}

export default TaskModel
