import MDList from './MDList.js'
import MDListItem from './MDListItem.js'

/**
 * Ordered list element – implements its own logic instead of extending MDList
 * to avoid circular import issues.
 */
export default class MDOrderedList extends MDList {
	static get defaultMdTag() {
		return '1. '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	constructor(props = {}) {
		// Force ordered flag for the parent class.
		super({ ...props, ordered: true })
	}
}

/**
 * Parses an ordered list block from markdown.
 * @param {string} text
 * @param {{i:number, rows:string[]}} context
 * @returns {MDOrderedList|false}
 */
MDOrderedList.parse = function (text, context = { i: 0, rows: [] }) {
	const { i = 0, rows = [] } = context
	const match = text.match(/^(\d+)\.\s+(.*)$/)
	if (!match) {
		return false
	}
	const children = []
	let j = i
	while (j < rows.length) {
		const row = rows[j]
		const itemMatch = row.match(/^(\d+)\.\s+(.*)$/)
		if (!itemMatch) break
		children.push(new MDListItem({ content: itemMatch[2] }))
		j++
	}
	context.i = j
	return new MDOrderedList({
		children,
	})
}
