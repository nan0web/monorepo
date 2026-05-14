import MDElement from './MDElement.js'
import MDListItem from './MDListItem.js'

/**
 * List element.
 */
export default class MDList extends MDElement {
	static get defaultTag() {
		return '<ul>'
	}
	static get defaultEnd() {
		return '</ul>'
	}
	static get defaultMdTag() {
		return ''
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/** @type {boolean} */
	ordered = false

	constructor(props = {}) {
		super(props)
		const { ordered = false } = props
		this.ordered = ordered
		if (this.ordered) {
			this.tag = '<ol>'
			this.end = '</ol>'
			this.mdTag = '1.'
		}
	}

	/**
	 * Add an element or raw string to the list.
	 * @param {MDElement | string} element
	 * @returns {this}
	 */
	add(element) {
		if (typeof element === 'string') {
			// Wrap raw strings into a list item element.
			element = new MDListItem({ content: element })
		}
		// Ensure the element is a markdown element before adding.
		if (!(element instanceof MDElement)) {
			throw new TypeError('Only markdown elements can be added to a list')
		}
		// super.add returns the inserted element; we forward that.
		return super.add(element)
	}

	/**
	 * Render the list as markdown.
	 * The list container itself does not emit a line; each child item
	 * renders its own markdown prefix (e.g., "- " or "1.").
	 * @param {object} props
	 * @param {number} [props.indent=0]
	 * @param {string} [props.format=".md"]
	 * @returns {string}
	 */
	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML({ indent })
		}
		const childrenLines = this.children.map((child) => child.toString({ indent, format }))
		return this.mdTag + childrenLines.filter((s) => '' !== s).join('') + this.mdEnd
	}

	/**
	 * Parse a list block from markdown.
	 * @param {string} text
	 * @param {{i:number, rows:string[]}} context
	 * @returns {MDList|false}
	 */
	static parse(text, context = { i: 0, rows: [] }) {
		const { i = 0, rows = [] } = context
		const match = text.match(/^(-|\d+\.)\s+(.*)$/)
		if (!match) {
			return false
		}
		const ordered = match[1].endsWith('.')
		const children = []
		let j = i
		while (j < rows.length) {
			const row = rows[j]
			const itemMatch = row.match(/^(-|\d+\.)\s+(.*)$/)
			if (!itemMatch) break
			children.push(new MDListItem({ content: itemMatch[2] }))
			j++
		}
		context.i = j
		return new MDList({
			ordered,
			children,
		})
	}
}
