import MDElement from './MDElement.js'

/**
 * Blockquote element.
 */
export default class MDBlockquote extends MDElement {
	static get defaultTag() {
		return '<blockquote>'
	}
	static get defaultEnd() {
		return '</blockquote>'
	}
	static get defaultMdTag() {
		return '>'
	}
	static get defaultMdEnd() {
		return '\n'
	}

	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML(props)
		}
		// Add space after > for proper markdown formatting
		return (
			this.content
				.split('\n')
				.map((line) => '> ' + line)
				.join('\n') + this.mdEnd
		)
	}

	static parse(text, context = {}) {
		let { i = 0, rows = [] } = context
		const match = text.match(/^>\s+(.*)$/)
		if (!match) {
			return false
		}
		if (rows.length && rows[i] === text) {
			let j = i + 1
			for (; j < rows.length; j++) {
				if (rows[j].startsWith('>')) {
					continue
				}
				context.i = j
				return new MDBlockquote({
					content: rows
						.slice(i, j)
						.map((row) => row.slice(1).trim())
						.join('\n'),
				})
			}
			context.i = j
			return new MDBlockquote({
				content: rows
					.slice(i, j)
					.map((row) => row.slice(1).trim())
					.join('\n'),
			})
		}
		return new MDBlockquote({ content: match[1] })
	}
}
