import MDHeading from './MDHeading.js'

/**
 * Heading1 element.
 */
export default class MDHeading1 extends MDHeading {
	static get defaultTag() {
		return '<h1>'
	}
	static get defaultEnd() {
		return '</h1>'
	}
	static get defaultMdTag() {
		return '# '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/**
	 * Parses a heading1 from markdown text.
	 * @param {string} text
	 * @returns {MDHeading1|false}
	 */
	static parse(text) {
		const match = text.match(/^#\s+(.*)$/)
		if (!match) {
			return false
		}
		return new MDHeading1({ content: match[1] })
	}

	/**
	 * @param {*} input
	 * @returns {MDHeading1}
	 */
	static from(input) {
		if (input instanceof MDHeading1) return input
		return new MDHeading1(input)
	}
}
