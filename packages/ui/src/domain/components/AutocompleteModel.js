import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Autocomplete component.
 * Represents a text input with search suggestions.
 */
export class AutocompleteModel extends Model {
	static content = {
		help: 'Current search text',
		default: '',
		type: 'string',
	}

	static options = {
		help: 'List of suggestions based on input',
		default: [],
		type: 'string[]',
	}

	/**
	 * @param {Partial<AutocompleteModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Current search text */ this.content
		/** @type {string[]} List of suggestions based on input */ this.options
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const response = yield {
			type: 'ask',
			field: 'content',
			schema: {
				help: 'Search or enter text',
				options: this.options,
			},
			component: 'Autocomplete',
			model: this,
		}

		this.content = response.value
		return { type: 'result', data: { selected: this.content } }
	}
}
