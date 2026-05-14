import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Confirmation dialog.
 */
export class ConfirmModel extends Model {
	static title = {
		help: 'Short title for the action',
		default: 'Confirm Action',
		type: 'string',
	}

	static message = {
		help: 'The question asked to the user',
		default: 'Are you sure?',
		type: 'string',
	}

	static okLabel = {
		help: 'Text for the confirm button',
		default: 'Yes',
		type: 'string',
	}

	static cancelLabel = {
		help: 'Text for the cancel button',
		default: 'No',
		type: 'string',
	}

	/**
	 * @param {Partial<ConfirmModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Short title for the action */ this.title
		/** @type {string} The question asked to the user */ this.message
		/** @type {string} Text for the confirm button */ this.okLabel
		/** @type {string} Text for the cancel button */ this.cancelLabel
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const response = yield {
			type: 'ask',
			field: 'confirmed',
			schema: { type: 'boolean', help: this.message },
			component: 'Confirm',
			model: this,
		}

		return { type: 'result', data: { confirmed: response.value === true } }
	}
}
