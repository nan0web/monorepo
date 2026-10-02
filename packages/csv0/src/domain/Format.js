import { Format as BaseFormat } from '@nan0web/types'

/**
 * Base Format Model for CSV0 typed columns.
 */
export class Format extends BaseFormat {
	/**
	 * Formats a JS value into a string representation for CSV cells.
	 * @param {any} value
	 * @returns {string}
	 */
	stringify(value) {
		if (value === null || value === undefined) return ''
		return String(value)
	}

	/**
	 * Parses a raw string from a CSV cell into native JS value.
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
