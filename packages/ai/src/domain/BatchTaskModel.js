import { Model } from '@nan0web/types'

export class BatchTaskModel extends Model {
	static id = {
		help: 'Task identifier',
		default: '',
		type: 'string',
	}

	static task = {
		help: 'Task command or type (e.g. cnai:refactor)',
		default: '',
		type: 'string',
	}

	static context = {
		help: 'Context parameters for the task',
		default: {},
		type: 'object',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.id
		/** @type {string} */ this.task
		/** @type {object} */ this.context
	}
}
