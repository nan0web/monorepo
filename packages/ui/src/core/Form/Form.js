import Message from '@nan0web/co'
import FormMessage from './Message.js'
import FormInput from './Input.js'

/**
 * Abstract form for data entry.
 *
 * @class UIForm
 * @extends FormMessage
 * @property {FormInput[]} fields - Form fields.
 * @property {Object} state - Current form state (field values).
 * @property {string} title - Form title.
 * @property {Object} schema - Validation schema (optional).
 */
export default class UIForm extends FormMessage {
	/** @type {FormInput[]} */ fields = []
	/** @type {Object} */ state = {}
	/** @type {string} */ title = ''
	/** @type {Object} */ schema = {}

	/* ------------------------------------------------------------------ */
	/*                     static validation registry                       */
	/* ------------------------------------------------------------------ */

	/** @type {Object<string,Function>} */
	static _validations = {}

	/**
	 * Register a custom validation that can be referenced by name in a schema.
	 *
	 * @param {string} name - Identifier used in schema.validation.
	 * @param {(value:any)=>true|string} fn - Function returns true if valid,
	 *   otherwise returns an error message.
	 */
	static addValidation(name, fn) {
		if (typeof name !== 'string' || typeof fn !== 'function') {
			throw new Error('validation name must be a string and fn must be a function')
		}
		UIForm._validations[name] = fn
	}

	/**
	 * Create a new UIForm.
	 *
	 * @param {Object} [props={}] - Form properties.
	 * @param {string} [props.title] - Form title.
	 * @param {FormInput[]} [props.fields=[]] - Form fields.
	 * @param {Object} [props.state={}] - Initial form state.
	 * @param {Object} [props.schema] - Validation schema.
	 */
	constructor(props = {}) {
		super(props)

		const { title = '', fields = [], state = {}, schema = {}, ...rest } = props

		// Normalise fields
		this.fields = fields.map((f) => FormInput.from(f))
		this.title = title
		this.state = { ...state }
		this.schema = schema

		// Update meta with form data
		this.meta = {
			title: this.title,
			fields: this.fields.map((f) => (f.toJSON ? f.toJSON() : f)),
			initialState: this.state,
		}
	}

	/* ------------------------------------------------------------------ */
	/*                              API                                   */
	/* ------------------------------------------------------------------ */

	/**
	 * Returns a new UIForm instance with updated state.
	 *
	 * @param {Object} data - Partial state to merge.
	 * @returns {UIForm}
	 */
	setData(data) {
		return new UIForm({
			...this,
			state: { ...this.state, ...data },
		})
	}

	/**
	 * Retrieves a field definition by its name.
	 *
	 * @param {string} name - Field name.
	 * @returns {FormInput|undefined}
	 */
	getField(name) {
		return this.fields.find((f) => f.name === name)
	}

	/**
	 * Returns current form values.
	 *
	 * @returns {Object}
	 */
	getValues() {
		return { ...this.state }
	}

	/**
	 * Validates the entire form.
	 *
	 * @returns {any}
	 */
	validate() {
		/** @type {any} */
		const errors = {}
		let isValid = true

		this.fields.forEach((field) => {
			const fieldValue = this.state[field.name]

			// Required validation based on field definition or schema
			if (
				field.required &&
				(fieldValue === '' || fieldValue === null || fieldValue === undefined)
			) {
				errors[field.name] = 'This field is required'
				isValid = false
				return
			}

			// Validation via schema (if provided) or field type
			const { isValid: fieldValid, errors: fieldErrors } = this.validateField(
				field.name,
				fieldValue,
			)

			if (!fieldValid) {
				Object.assign(errors, fieldErrors)
				isValid = false
			}
		})

		return { isValid, errors }
	}

	/**
	 * Validates a single field.
	 *
	 * @param {string} fieldName - Name of the field.
	 * @param {*} value - Value to validate.
	 * @returns {{isValid: boolean, errors: Object}}
	 */
	validateField(fieldName, value) {
		const field = this.getField(fieldName)
		if (!field) return { isValid: false, errors: { [fieldName]: 'Field not found' } }

		// Merge schema from UIForm.schema with field.type if schema does not specify a type
		const schemaFromField = this.schema?.[fieldName] ? { ...this.schema[fieldName] } : {}
		if (!schemaFromField.type && field.type) {
			schemaFromField.type = field.type
		}

		return this.validateValue(fieldName, value, schemaFromField)
	}

	/**
	 * Validates a value against a schema.
	 *
	 * @param {string} fieldName - Name of the field.
	 * @param {*} value - Value to validate.
	 * @param {Object} schema - Validation schema.
	 * @returns {{isValid: boolean, errors: Object}}
	 */
	validateValue(fieldName, value, schema) {
		const errors = {}
		let isValid = true

		// Required rule (if defined in schema)
		if (schema.required && (value === '' || value === null || value === undefined)) {
			errors[fieldName] = 'This field is required'
			isValid = false
		}

		if (schema.minLength && value && value.length < schema.minLength) {
			errors[fieldName] = `Minimum length is ${schema.minLength}`
			isValid = false
		}

		if (schema.maxLength && value && value.length > schema.maxLength) {
			errors[fieldName] = `Maximum length is ${schema.maxLength}`
			isValid = false
		}

		if (schema.pattern && value && !schema.pattern.test(value)) {
			errors[fieldName] = schema.errorMessage || 'Invalid format'
			isValid = false
		}

		// Type validation
		if (schema.type) {
			if (schema.type === 'email') {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (value && !emailRegex.test(value)) {
					errors[fieldName] = 'Invalid email format'
					isValid = false
				}
			} else if (schema.type === 'number') {
				if (value !== '' && isNaN(Number(value))) {
					errors[fieldName] = 'Must be a number'
					isValid = false
				}
			}
		}

		// Custom validation – can be a function or a string referencing a static validation
		if (schema.validation) {
			let result
			if (typeof schema.validation === 'function') {
				result = schema.validation(value)
			} else if (typeof schema.validation === 'string') {
				const fn = UIForm._validations[schema.validation]
				if (!fn) {
					throw new Error(`validation "${schema.validation}" not registered`)
				}
				result = fn(value)
			}
			if (result !== true) {
				errors[fieldName] = result || 'Invalid value'
				isValid = false
			}
		}

		return { isValid, errors }
	}

	/**
	 * Serialises the form to a plain JSON object.
	 *
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			type: this.type,
			time: new Date(this.time).toISOString(),
			title: this.title,
			fields: this.fields.map((f) => (f.toJSON ? f.toJSON() : f)),
			state: this.state,
			meta: this.meta,
		}
	}

	/**
	 * @param {*} input
	 * @returns {UIForm}
	 */
	static from(input) {
		if (input instanceof UIForm) return input
		if (input instanceof Message) {
			const Class = input.constructor
			const fields = []
			for (const [name, value] of Object.entries(input)) {
				fields.push(
					new FormInput({
						name,
						label: Class[name]?.label ?? Class[`${name}Label`] ?? name,
						type: Class[name]?.type ?? Class[`${name}Type`] ?? typeof value,
						required: Class[name]?.required ?? Class[`${name}Required`] ?? false,
						placeholder: Class[name]?.placeholder ?? Class[`${name}Placeholder`] ?? '',
						defaultValue: Class[name]?.defaultValue ?? Class[`${name}Default`] ?? '',
						validation: Class[name]?.validation ?? Class[`${name}Validation`] ?? (() => true),
					}),
				)
			}
			return new UIForm({
				title: Class.name,
				fields,
			})
		}
		return new UIForm(input)
	}

	/**
	 * Auto‑generates form fields from a plain object.
	 *
	 * @param {Object} data - Example data object; its own enumerable keys become field names.
	 * @param {Object<string, Partial<import("./Input.js").default>>} [overrides={}]
	 *        Optional per‑field overrides (e.g. type, required, label).
	 *
	 * @returns {UIForm} Form with Array of `FormInput` instances as form.fields
	 *
	 * Example:
	 *   const fields = generateFieldsFromObject({ name: "", age: 0 }, {
	 *     age: { type: FormInput.TYPES.NUMBER, required: true }
	 *   })
	 */
	static parse(data, overrides = {}) {
		const fields = Object.keys(data).map((name) => {
			const custom = overrides[name] || {}
			const label = custom.label ?? name.charAt(0).toUpperCase() + name.slice(1)
			return new FormInput({
				name,
				label,
				type: custom.type ?? FormInput.TYPES.TEXT,
				required: !!custom.required,
				placeholder: custom.placeholder ?? '',
				options: custom.options ?? [],
				validation: custom.validation ?? undefined,
				defaultValue: custom.defaultValue ?? '',
			})
		})
		return new UIForm({ fields })
	}
}
