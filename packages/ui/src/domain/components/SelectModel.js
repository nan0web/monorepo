import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Select component.
 * Represents a dropdown choice selection.
 */
export class SelectModel extends Model {
	static content = {
		help: 'Currently selected item or default placeholder',
		default: 'Choose option',
		type: 'string',
	}

	static options = {
		help: 'List of available options for selection',
		default: ['Alpha', 'Beta', 'Gamma'],
		type: 'string[]',
	}

	/**
	 * @param {Partial<SelectModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Currently selected item or default placeholder */ this.content
		/** @type {string[]} List of available options for selection */ this.options
	}

	/**
	 * @returns {AsyncGenerator<any, { type: 'result', data: { selected: string } }, any>}
	 */
	async *run() {
		const response = yield {
			type: 'ask',
			field: 'content',
			schema: {
				help: 'Select an option',
				options: this.options,
				validate: (val) => this.options?.includes(val) || 'Invalid option selected',
			},
			component: 'Select',
			model: this,
		}

		this.content = response.value
		return { type: 'result', data: { selected: this.content } }
	}
}
