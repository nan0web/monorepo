import { Model } from './Model.js'

/**
 * Base Format Model for data serialization, parsing and validation.
 */
export class Format extends Model {
	/**
	 * Formats a JS value into a string representation.
	 * @param {any} value
	 * @returns {string}
	 */
	stringify(value) {
		if (value === null || value === undefined) return ''
		return String(value)
	}

	/**
	 * Parses a raw string into native JS value.
	 * @param {string} text
	 * @returns {any}
	 */
	parse(text) {
		return text
	}

	/**
	 * Validates a value according to format constraints.
	 * @param {any} value
	 * @returns {boolean}
	 */
	validate(value) {
		return true
	}
}
