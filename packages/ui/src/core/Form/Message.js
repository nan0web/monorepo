import UiMessage from '../Message/Message.js'

/**
 * FormMessage – specialized UiMessage for forms.
 * It carries form-specific data and schema for validation.
 *
 * @class FormMessage
 * @extends UiMessage
 */
export default class FormMessage extends UiMessage {
	/**
	 * Creates a FormMessage.
	 *
	 * @param {Object} [input={}] - Message properties.
	 */
	constructor(input = {}) {
		super({ type: 'form', ...input })
		const { data = {}, schema = {} } = input

		// Store data and schema for easy access
		this.data = data
		this.schema = schema
	}

	/**
	 * Returns a new FormMessage with merged data.
	 *
	 * @param {Object} newData - Data to merge.
	 * @returns {FormMessage}
	 */
	addData(newData) {
		return new FormMessage({
			...this,
			data: { ...this.data, ...newData },
		})
	}

	/**
	 * Validates the provided data against the schema.
	 *
	 * @param {Object} data - Data to validate.
	 * @returns {{isValid: boolean, errors: Object}}
	 */
	validateData(data) {
		const errors = {}

		if (!this.schema) return { isValid: true, errors }

		for (const [field, rules] of Object.entries(this.schema)) {
			const value = data[field]

			if (rules.required && (value === undefined || value === null || value === '')) {
				errors[field] = 'Field is required'
				continue
			}

			if (rules.type) {
				if (rules.type === 'email') {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
					if (value && !emailRegex.test(value)) {
						errors[field] = 'Invalid email format'
					}
				} else if (rules.type === 'number') {
					if (value !== '' && isNaN(Number(value))) {
						errors[field] = 'Must be a number'
					}
				}
			}

			if (rules.minLength && value && value.length < rules.minLength) {
				errors[field] = `Minimum length is ${rules.minLength}`
			}

			if (rules.maxLength && value && value.length > rules.maxLength) {
				errors[field] = `Maximum length is ${rules.maxLength}`
			}
		}

		return { isValid: Object.keys(errors).length === 0, errors }
	}
}
