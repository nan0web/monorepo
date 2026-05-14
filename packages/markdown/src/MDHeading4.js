import MDHeading from './MDHeading.js'

/**
 * Heading4 element.
 */
export default class MDHeading4 extends MDHeading {
	static get defaultTag() {
		return '<h4>'
	}
	static get defaultEnd() {
		return '</h4>'
	}
	static get defaultMdTag() {
		return '#### '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/**
	 * Parses a heading4 from markdown text.
	 * @param {string} text
	 * @returns {MDHeading4|false}
	 */
	static parse(text) {
		const match = text.match(/^####\s+(.*)$/)
		if (!match) {
			return false
		}
		return new MDHeading4({ content: match[1] })
	}

	/**
	 * @param {*} input
	 * @returns {MDHeading4}
	 */
	static from(input) {
		if (input instanceof MDHeading4) return input
		return new MDHeading4(input)
	}
}
