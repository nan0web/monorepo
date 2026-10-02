import { Format } from '../Format.js'

/**
 * NumberFormat - numeric representation.
 */
export class NumberFormat extends Format {
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	stringify(value) {
		if (value === null || value === undefined || value === '') return ''
		return String(value)
	}

	/**
	 * @param {string} text
	 * @returns {number | null}
	 */
	parse(text) {
		if (text === '' || text === null || text === undefined) return null
		const num = Number(text)
		return isNaN(num) ? null : num
	}

	/**
	 * @param {any} value
	 * @returns {boolean}
	 */
	validate(value) {
		return typeof value === 'number' && !isNaN(value)
	}
}
