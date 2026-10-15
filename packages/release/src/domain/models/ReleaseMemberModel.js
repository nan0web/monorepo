import { Model } from '@nan0web/types'

export class ReleaseMemberModel extends Model {
	static role = { type: 'string', required: true }
	static name = { type: 'string', required: true }
	static handle = { type: 'string' }

	/**
	 * @param {Partial<ReleaseMemberModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Role / Position (Посада) */
		this.role
		/** @type {string} Full Name (Ім'я) */
		this.name
		/** @type {string} Login / Handle (Логін без @) */
		this.handle
	}
}
