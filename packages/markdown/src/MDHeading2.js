import MDHeading from './MDHeading.js'

/**
 * Heading2 element.
 */
export default class MDHeading2 extends MDHeading {
	static get defaultTag() {
		return '<h2>'
	}
	static get defaultEnd() {
		return '</h2>'
	}
	static get defaultMdTag() {
		return '## '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/**
	 * Parses a heading2 from markdown text.
	 * @param {string} text
	 * @returns {MDHeading2|false}
	 */
	static parse(text) {
		const match = text.match(/^##\s+(.*)$/)
		if (!match) {
			return false
		}
		return new MDHeading2({ content: match[1] })
	}

	/**
	 * @param {*} input
	 * @returns {MDHeading2}
	 */
	static from(input) {
		if (input instanceof MDHeading2) return input
		return new MDHeading2(input)
	}
}
