import MDElement from './MDElement.js'

/**
 * Table cell element.
 */
export default class MDTableCell extends MDElement {
	static get defaultTag() {
		return '<td>'
	}
	static get defaultEnd() {
		return '</td>'
	}
	static get defaultMdTag() {
		return ' '
	}
	static get defaultMdEnd() {
		return ' |'
	}

	static parse(text, context = {}) {
		return false
		let { i = 0, rows = [] } = context
		const match = text.match(/^.*$/)
		if (!match) {
			return false
		}
		const content = match[0]
		i = i + match[0].length
		return new MDTableCell({
			content,
		})
	}
}
