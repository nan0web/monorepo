import MDElement from './MDElement.js'
import MDTableRow from './MDTableRow.js'

/**
 * Table element.
 */
export default class MDTable extends MDElement {
	static get defaultTag() {
		return '<table>'
	}
	static get defaultEnd() {
		return '</table>'
	}
	static get defaultMdTag() {
		return '|'
	}
	static get defaultMdEnd() {
		return '|\n'
	}

	/**
	 * Parses markdown table text into MDTable instance.
	 * @param {string} text - Markdown text to parse
	 * @param {{i?:number, rows?:string[]}} context - Parsing context (unused)
	 * @returns {MDTable|false} Parsed MDTable instance or false if not a table
	 */
	static parse(text, context = {}) {
		// Split text into lines
		const lines = text.split('\n').filter((line) => line.trim() !== '')

		// Basic validation: at least 2 lines (header + separator)
		if (lines.length < 2) return false

		// Check if all lines are valid table rows (start and end with |)
		for (const line of lines) {
			const trimmed = line.trim()
			if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
				return false
			}
		}

		// Validate separator line (second line) contains proper table separator format
		if (lines.length > 1) {
			const headerCells = lines[0].trim().split('|').filter((c, i, a) => i > 0 && i < a.length - 1)
			const separatorLine = lines[1].trim()
			const separatorCells = separatorLine.split('|').filter((c, i, a) => i > 0 && i < a.length - 1)

			if (headerCells.length !== separatorCells.length) {
				return false
			}

			// Check if separator line has proper dash/colon format
			if (!/^[\s|:-]+$/.test(separatorLine)) {
				// Additional validation to ensure it's a proper separator
				const isValidSeparator = separatorCells.every((cell) => {
					const trimmed = cell.trim()
					return trimmed === '' || /^[-:]+$/.test(trimmed)
				})
				if (!isValidSeparator) {
					return false
				}
			}
		}

		// Create instance with content and children as MDTableRow elements.
		const content = lines.join('\n')
		const children = lines.map((line) => new MDTableRow({ content: line }))

		return new MDTable({
			content,
			children,
			mdTag: '', // Clear to avoid double pipes if content is full
			mdEnd: '\n'
		})
	}
}
