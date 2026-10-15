import { Model } from '@nan0web/types'

export class ReleaseIssueModel extends Model {
	static level = { type: 'string', default: 'warning' } // 'error' | 'warning' | 'info'
	static code = { type: 'string' }
	static message = { type: 'string', required: true }
	static source = { type: 'string' }
	static file = { type: 'string' }

	/**
	 * @param {Partial<ReleaseIssueModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type { 'error' | 'warning' | 'info' } Level of issue */
		this.level
		/** @type {string} Issue code */
		this.code
		/** @type {string} Issue message */
		this.message
		/** @type {string} Issue source */
		this.source
		/** @type {string} Issue file */
		this.file
	}
}
