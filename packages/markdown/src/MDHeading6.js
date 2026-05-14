import MDHeading from './MDHeading.js'

/**
 * Heading6 element.
 */
export default class MDHeading6 extends MDHeading {
	static get defaultTag() {
		return '<h6>'
	}
	static get defaultEnd() {
		return '</h6>'
	}
	static get defaultMdTag() {
		return '###### '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/**
	 * Parses a heading6 from markdown text.
	 * @param {string} text
	 * @returns {MDHeading6|false}
	 */
	static parse(text) {
		const match = text.match(/^######\s+(.*)$/)
		if (!match) {
			return false
		}
		return new MDHeading6({ content: match[1] })
	}

	/**
	 * @param {*} input
	 * @returns {MDHeading6}
	 */
	static from(input) {
		if (input instanceof MDHeading6) return input
		return new MDHeading6(input)
	}
}
