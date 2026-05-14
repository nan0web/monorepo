import MDElement from './MDElement.js'

/**
 * Horizontal rule element.
 */
export default class MDHorizontalRule extends MDElement {
	static get defaultTag() {
		return '<hr>'
	}
	static get defaultMdTag() {
		return '---'
	}
	static get defaultMdEnd() {
		return '\n'
	}
	static get defaultEnd() {
		return ''
	}

	static parse(text) {
		const match = text.match(/^---$/)
		if (!match) {
			return false
		}
		return new this()
	}
}
