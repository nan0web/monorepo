import MDHeading from './MDHeading.js'

/**
 * Heading5 element.
 */
export default class MDHeading5 extends MDHeading {
	static get defaultTag() {
		return '<h5>'
	}
	static get defaultEnd() {
		return '</h5>'
	}
	static get defaultMdTag() {
		return '##### '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/**
	 * Parses a heading5 from markdown text.
	 * @param {string} text
	 * @returns {MDHeading5|false}
	 */
	static parse(text) {
		const match = text.match(/^#####\s+(.*)$/)
		if (!match) {
			return false
		}
		return new MDHeading5({ content: match[1] })
	}

	/**
	 * @param {*} input
	 * @returns {MDHeading5}
	 */
	static from(input) {
		if (input instanceof MDHeading5) return input
		return new MDHeading5(input)
	}
}
