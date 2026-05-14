import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Input component.
 */
export class InputModel extends Model {
	static type = {
		help: 'HTML5 Input type attribute',
		default: 'text',
		options: ['text', 'email', 'password', 'number', 'tel', 'url', 'date'],
	}

	static label = {
		help: 'Label displayed above the input',
		default: '',
		type: 'string',
	}

	static placeholder = {
		help: 'Placeholder text shown when empty',
		default: '',
		type: 'string',
	}

	static required = {
		help: 'Whether the field must be filled out',
		default: false,
		type: 'boolean',
	}

	static pattern = {
		help: 'RegExp pattern for validation (e.g. [A-Z]{3})',
		default: '',
		type: 'string',
	}

	static min = {
		help: 'Minimum value (for number/date types)',
		default: '',
		type: 'string',
	}

	static max = {
		help: 'Maximum value (for number/date types)',
		default: '',
		type: 'string',
	}

	static step = {
		help: 'Step interval (for number/date types)',
		default: '',
		type: 'string',
	}

	static hint = {
		help: 'Helper text displayed below the input',
		default: '',
		type: 'string',
	}

	static disabled = {
		help: 'Whether the input is greyed out and uneditable',
		default: false,
		type: 'boolean',
	}

	static content = {
		help: 'The actual value of the input',
		default: '',
		type: 'string',
	}

	/**
	 * @param {Partial<InputModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} HTML5 Input type attribute */ this.type
		/** @type {string} Label displayed above the input */ this.label
		/** @type {string} Placeholder text shown when empty */ this.placeholder
		/** @type {boolean} Whether the field must be filled out */ this.required
		/** @type {string} RegExp pattern for validation */ this.pattern
		/** @type {string} Minimum value */ this.min
		/** @type {string} Maximum value */ this.max
		/** @type {string} Step interval */ this.step
		/** @type {string} Helper text displayed below the input */ this.hint
		/** @type {boolean} Whether the input is disabled */ this.disabled
		/** @type {string} The actual value of the input */ this.content
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const response = yield {
			type: 'ask',
			field: 'content',
			schema: {
				help: this.label || this.placeholder || 'Enter value',
				validate: (val) => {
					if (this.required && !val) return 'This field is required'
					if (this.pattern && val) {
						try {
							const re = new RegExp(`^${this.pattern}$`)
							if (!re.test(val)) return 'Invalid format'
						} catch (e) {
							// fallback if pattern is malformed
							return 'Invalid format'
						}
					}
					return true
				},
			},
			component: 'Input',
			model: this,
		}

		this.content = response.value
		return { type: 'result', data: { value: this.content } }
	}
}
