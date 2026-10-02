import { Format } from '../Format.js'

/**
 * StringFormat - default string representation.
 */
export class StringFormat extends Format {
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	stringify(value) {
		if (value === null || value === undefined) return ''
		return String(value)
	}

	/**
	 * @param {string} text
	 * @returns {string}
	 */
	parse(text) {
		return text ?? ''
	}

	/**
	 * @param {any} value
	 * @returns {boolean}
	 */
	validate(value) {
		return typeof value === 'string'
	}
}
