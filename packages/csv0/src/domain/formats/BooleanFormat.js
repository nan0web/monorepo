import { Format } from '../Format.js'

/**
 * BooleanFormat - compact 0/1 serialization for boolean values.
 */
export class BooleanFormat extends Format {
	static UI = {
		invalidBoolean: 'Value is not a valid boolean',
	}

	/**
	 * @param {any} value
	 * @returns {string}
	 */
	stringify(value) {
		if (value === null || value === undefined || value === '') return ''
		if (value === true || value === 1 || value === '1' || value === 'true') return '1'
		return '0'
	}

	/**
	 * @param {string} text
	 * @returns {boolean}
	 */
	parse(text) {
		if (text === '1' || text === 'true' || text === 'yes') return true
		return false
	}

	/**
	 * @param {any} value
	 * @returns {boolean}
	 */
	validate(value) {
		return typeof value === 'boolean' || value === 0 || value === 1 || value === '0' || value === '1'
	}
}
