import MDHeading from './MDHeading.js'

/**
 * Heading3 element.
 */
export default class MDHeading3 extends MDHeading {
	static get defaultTag() {
		return '<h3>'
	}
	static get defaultEnd() {
		return '</h3>'
	}
	static get defaultMdTag() {
		return '### '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/**
	 * Parses a heading3 from markdown text.
	 * @param {string} text
	 * @returns {MDHeading3|false}
	 */
	static parse(text) {
		const match = text.match(/^###\s+(.*)$/)
		if (!match) {
			return false
		}
		return new MDHeading3({ content: match[1] })
	}

	/**
	 * @param {*} input
	 * @returns {MDHeading3}
	 */
	static from(input) {
		if (input instanceof MDHeading3) return input
		return new MDHeading3(input)
	}
}
