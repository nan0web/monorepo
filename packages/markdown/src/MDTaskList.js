import MDList from './MDList.js'
import MDListItem from './MDListItem.js'

/**
 * Task list element.
 */
export default class MDTaskList extends MDList {
	static get defaultMdTag() {
		return ''
	}
	static get defaultMdEnd() {
		return '\n'
	}
	static get defaultEnd() {
		return ''
	}

	constructor(props = {}) {
		super(props)
		this.end = ''
		this.tag = '<ul>'
		this.mdTag = ''
		this.mdEnd = '\n'
	}

	/**
	 * Parse a task list block from markdown.
	 * @param {string} text
	 * @param {object} context
	 * @returns {MDTaskList | false}
	 */
	static parse(text, context = {}) {
		const { i = 0, rows = [] } = context
		const match = text.match(/^- \[([ xX>\-])\] (.*)$/)
		if (!match) {
			return false
		}
		const children = []
		let j = i
		while (j < rows.length) {
			const row = rows[j]
			const itemMatch = row.match(/^- \[([ xX>\-])\] (.*)$/)
			if (!itemMatch) break
			const parsedItem = MDListItem.parse(row)
			if (parsedItem) {
				children.push(parsedItem)
			}
			j++
		}
		context.i = j
		return new MDTaskList({
			children,
		})
	}

	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML({ indent })
		}
		const childrenLines = this.children.map((child) => child.toString({ indent, format }))
		return childrenLines.filter((s) => '' !== s).join('')
	}
}

