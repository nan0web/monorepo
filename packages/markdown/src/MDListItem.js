import MDElement from './MDElement.js'

/**
 * List item element.
 */
export default class MDListItem extends MDElement {
	static get defaultTag() {
		return '<li>'
	}
	static get defaultEnd() {
		return '</li>'
	}
	static get defaultMdTag() {
		return '- '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	static parse(text) {
		const match = text.match(/^(-|\d+\.)\s+(.*)$/)
		if (!match) {
			return false
		}
		const content = match[2]
		return new MDListItem({
			content,
		})
	}
}
