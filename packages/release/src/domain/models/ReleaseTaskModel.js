import { Model } from '@nan0web/types'

export class ReleaseTaskModel extends Model {
	static id = { type: 'string', required: true }
	static title = { type: 'string', required: true }
	static status = { type: 'string', default: 'todo' } // 'todo' | 'work' | 'done' | 'fail'
	static assignee = { type: 'string' }
	static estimateHours = { type: 'number' }
	static spentHours = { type: 'number' }
	static notes = { type: 'string' }

	/**
	 * @param {Partial<ReleaseTaskModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Task ID */
		this.id
		/** @type {string} Task Title */
		this.title
		/** @type {'todo' | 'work' | 'done' | 'fail'} Task Status */
		this.status
		/** @type {string} Assignee */
		this.assignee
		/** @type {number} Estimated Hours */
		this.estimateHours
		/** @type {number} Spent Hours */
		this.spentHours
		/** @type {string} Notes */
		this.notes
	}
}
