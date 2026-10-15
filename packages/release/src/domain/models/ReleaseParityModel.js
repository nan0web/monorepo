import { Model } from '@nan0web/types'

export class ReleaseParityModel extends Model {
	static collection = { type: 'string', required: true }
	static expected = { type: 'number', required: true }
	static actual = { type: 'number', required: true }
	static synced = { type: 'boolean', default: true }
	static comment = { type: 'string' }

	/**
	 * @param {Partial<ReleaseParityModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Collection name */
		this.collection
		/** @type {number} Expected count */
		this.expected
		/** @type {number} Actual count */
		this.actual
		/** @type {boolean} Synced flag */
		this.synced
		/** @type {string} Audit comment */
		this.comment
	}
}
