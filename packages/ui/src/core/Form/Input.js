/**
 * @typedef {Object} Filter
 * @property {string} [q=""]
 * @property {number} [offset=0]
 * @property {number} [limit=36]
 */

/** @typedef {Array<string> | ((filter: Filter) => Promise<string[]>)} InputOptions */

/**
 * Form input field descriptor.
 *
 * @class FormInput
 * @property {string} name - Field name.
 * @property {string} label - Display label.
 * @property {string} type - Input type (text, email, number, select, etc.).
 * @property {boolean} required - Whether the field is required.
 * @property {string} placeholder - Placeholder text.
 * @property {InputOptions} options - Select options (if type is 'select').
 * @property {Function} validation - Custom validation function.
 * @property {string} mask - Mask pattern (e.g. '###-###').
 * @property {*} defaultValue - Default value.
 */
export default class FormInput {
	/** @type {string} */ name = ''
	/** @type {string} */ label = ''
	/** @type {string} */ type = 'text'
	/** @type {boolean} */ required = false
	/** @type {string} */ placeholder = ''
	/** @type {InputOptions} */ options = []
	/** @type {Function} */ validation = () => true
	/** @type {string} */ mask = ''
	/** @type {*} */ defaultValue = null

	/**
	 * Predefined input types.
	 */
	static TYPES = {
		TEXT: 'text',
		EMAIL: 'email',
		NUMBER: 'number',
		SELECT: 'select',
		CHECKBOX: 'checkbox',
		TEXTAREA: 'textarea',
		PASSWORD: 'password',
		SECRET: 'secret',
		MASK: 'mask',
		CONFIRM: 'confirm',
		TOGGLE: 'toggle',
		MULTISELECT: 'multiselect',
		AUTOCOMPLETE: 'autocomplete',
	}

	/**
	 * Create a new form input.
	 *
	 * @param {Object} props - Input properties.
	 * @param {string} props.name - Field name.
	 * @param {string} [props.label=props.name] - Display label.
	 * @param {string} [props.type='text'] - Input type.
	 * @param {boolean} [props.required=false] - Is required.
	 * @param {string} [props.placeholder=''] - Placeholder.
	 * @param {InputOptions} [props.options=[]] - Select options or async function to retrieve data with the search and page.
	 * @param {Function} [props.validation] - Custom validation.
	 * @param {string} [props.mask=''] - Mask pattern.
	 * @param {*} [props.defaultValue=null] - Default value.
	 */
	constructor(props) {
		const {
			name,
			label = name,
			type = FormInput.TYPES.TEXT,
			required = this.required,
			placeholder = this.placeholder,
			options = [],
			validation = this.validation,
			mask = '',
			defaultValue = this.defaultValue,
		} = props

		if (!name) {
			throw new TypeError('FormInput.name is required')
		}

		this.name = String(name)
		this.label = String(label)
		this.type = String(type)
		this.required = Boolean(required)
		this.placeholder = String(placeholder)
		this.options = options
		this.validation = validation
		this.mask = String(mask)
		this.defaultValue = defaultValue

		this.requireValidType()
	}

	requireValidType() {
		if (!Object.values(FormInput.TYPES).includes(this.type)) {
			throw new TypeError(
				[
					'FormInput.type is invalid!',
					['Provided', this.type].join(': '),
					'Available types:',
					...Object.values(FormInput.TYPES).map((t) => `  - ${t}`),
				].join('\n'),
			)
		}
	}

	/**
	 * Serialises the input to a plain JSON object.
	 *
	 * @returns {Object}
	 */
	toJSON() {
		return {
			name: this.name,
			label: this.label,
			type: this.type,
			required: this.required,
			placeholder: this.placeholder,
			options: this.options,
			mask: this.mask,
			defaultValue: this.defaultValue,
		}
	}

	/**
	 * @param {*} input
	 * @returns {FormInput}
	 */
	static from(input) {
		if (input instanceof FormInput) return input
		if (typeof input === 'string') {
			return new FormInput({ name: input, label: input })
		}
		return new FormInput(input)
	}
}
