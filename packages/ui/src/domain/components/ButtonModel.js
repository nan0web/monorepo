import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Button component.
 */
export class ButtonModel extends Model {
	static variant = {
		help: 'Button visual style',
		default: 'primary',
		options: ['primary', 'secondary', 'danger', 'ghost'],
	}

	static content = {
		help: 'Text displayed inside the button',
		default: 'Click me',
		type: 'string',
	}

	static href = {
		help: 'Optional link URL',
		default: '',
		type: 'string',
	}

	static disabled = {
		help: 'Whether the button can be clicked',
		default: false,
		type: 'boolean',
	}

	static clicked = {
		help: 'Interal flag: true if clicked',
		default: false,
		type: 'boolean',
	}

	/**
	 * @param {Partial<ButtonModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {'primary'|'secondary'|'danger'|'ghost'} Button visual style */ this.variant
		/** @type {string} Text displayed inside the button */ this.content
		/** @type {string} Optional link URL */ this.href
		/** @type {boolean} Whether the button can be clicked */ this.disabled
		/** @type {boolean} Reactive flag set to true when user activates the button */ this.clicked
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const response = yield {
			type: 'ask',
			field: 'clicked',
			schema: { help: 'Click the button' },
			component: 'Button',
			model: this,
		}

		this.clicked = response.value?.clicked || false
		return { type: 'result', data: { clicked: this.clicked } }
	}
}
