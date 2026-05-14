/**
 * Extends native String with convenient filtering helpers.
 * Provides methods for checking inclusion, starting, ending, and trimming strings.
 *
 * @class FilterString
 * @extends {String}
 */
class FilterString extends String {
	/**
	 * Check if the string includes any of the provided arguments.
	 * @param {...*} args - Arguments to check for inclusion
	 * @returns {boolean} True if any argument is included in the string
	 */
	inIncludes(...args) {
		return args.some((a) => this.includes(String(a)))
	}

	/**
	 * Check if the string starts with any of the provided arguments.
	 * @param {...*} args - Arguments to check for starting match
	 * @returns {boolean} True if any argument matches the start of the string
	 */
	inStarts(...args) {
		return args.some((a) => this.startsWith(String(a)))
	}

	/**
	 * Check if the string ends with any of the provided arguments.
	 * @param {...*} args - Arguments to check for ending match
	 * @returns {boolean} True if any argument matches the end of the string
	 */
	inEnds(...args) {
		return args.some((a) => this.endsWith(String(a)))
	}

	/**
	 * Trim specified characters from the end of the string.
	 * @param {string} [chars="\n\t "] - Characters to trim from the end
	 * @returns {string} String with specified characters trimmed from the end
	 */
	trimEnd(chars = '\n\t ') {
		if (chars === '') return String(this)
		let str = String(this)
		const charSet = new Set(chars)
		while (str.length > 0 && charSet.has(str[str.length - 1])) {
			str = str.slice(0, -1)
		}
		return str
	}

	/**
	 * Trim specified characters from the start of the string.
	 * @param {string} [chars="\n\t "] - Characters to trim from the start
	 * @returns {string} String with specified characters trimmed from the start
	 */
	trimStart(chars = '\n\t ') {
		if (chars === '') return String(this)

		let str = String(this)
		const charSet = new Set(chars)

		while (str.length > 0 && charSet.has(str[0])) {
			str = str.slice(1)
		}

		return str
	}

	/**
	 * Trim specified characters from both the start and end of the string.
	 * @param {string} [chars="\n\t "] - Characters to trim from both ends
	 * @returns {string} Trimmed string
	 */
	trim(chars = '\n\t ') {
		return String(new FilterString(new FilterString(this).trimStart(chars)).trimEnd(chars))
	}
}

export default FilterString
