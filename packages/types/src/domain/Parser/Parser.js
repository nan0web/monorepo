import Node from './Node.js'

/**
 * Base class that knows how to:
 *   1️⃣ read an indentation string,
 *   2️⃣ build a generic tree from a multiline text,
 *   3️⃣ stringify that tree again.
 *
 * Concrete parsers (NaN0, Markdown, …) inherit from it and
 * transform the generic tree into their own domain objects.
 */
export default class Parser {
	/** default line‑break & tab characters – override in ctor if you need something else */
	static EOL = '\n'
	static TAB = '\t'
	static SKIP = ['']

	/** @type {string} */
	eol
	/** @type {string} */
	tab
	/** @type {Array<string | Function>} */
	skip

	/**
	 * @param {object} input
	 * @param {string} [input.eol="\n"]
	 * @param {string} [input.tab="  "]
	 * @param {Array<string | Function>} [input.skip=[""]]
	 */
	constructor(input = {}) {
		const { eol = Parser.EOL, tab = Parser.TAB, skip = Parser.SKIP } = input
		this.eol = String(eol)
		this.tab = String(tab)
		this.skip = Array.isArray(skip) ? skip : [skip]
	}

	/**
	 * Indentation calculator.
	 * Returns how many *tab‑units* (default two spaces) the line starts with.
	 * @param {string} str
	 * @param {string[]} [prevRows=[]]
	 * @returns {number}
	 */
	readIndent(str, prevRows = []) {
		let indent = 0
		for (let i = 0; i < str.length; i += this.tab.length) {
			const slice = str.slice(i, i + this.tab.length)
			if (slice !== this.tab) break
			++indent
		}
		return indent
	}

	/**
	 * Build the generic tree using a single-pass scanner.
	 * @param {string} text
	 * @returns {Node}
	 */
	decode(text) {
		const root = new Node()
		const stack = [{ node: root, indent: -1 }]

		this.scanLines(text, (line, indent, lineNum, start, end, str, lines) => {
			while (stack.length && indent <= stack[stack.length - 1].indent) {
				stack.pop()
			}
			if (stack.length === 0) {
				const prev = lines.slice(-3).join(this.eol)
				throw new Error(`Parsing error: invalid indent ${indent} #${lineNum}: ${line}\n${prev}`)
			}
			const parent = stack[stack.length - 1].node
			const node = new Node({ content: line, indent })
			parent.children.push(node)
			stack.push({ node, indent })
		})

		return root
	}

	/**
	 * @callback ScanLinesCallback
	 * @param {string} content The parsed line content without indentation
	 * @param {number} indent Number of indent blocks
	 * @param {number} lineNum Current line number (1-indexed)
	 * @param {number} start Position of the first character of content
	 * @param {number} end Position of the end of the line
	 * @param {string} str The full original text
	 * @param {string[]} lines Array of lines parsed so far
	 * @returns {void}
	 */

	/**
	 * Advanced pointer-based scanner.
	 * Calls callback for each valid line.
	 * @param {string} text
	 * @param {ScanLinesCallback} callback
	 */
	scanLines(text, callback) {
		const str = String(text)
		const len = str.length
		const eol = this.eol
		const eolLen = eol.length
		const tabLen = this.tab.length
		const skip = this.skip
		const lines = []

		let pos = 0
		let lineNum = 0

		while (pos < len) {
			let end = str.indexOf(eol, pos)
			if (end === -1) end = len
			lines.push(str.slice(pos, end))

			const lineNumCurrent = ++lineNum
			const lineStart = pos
			const lineEnd = end
			pos = end + eolLen

			// Fast check for empty line (skip whitespace)
			let contentStart = lineStart
			while (contentStart < lineEnd && str[contentStart] <= ' ') contentStart++
			if (contentStart === lineEnd) continue // Empty line

			// Calculate indent using overridable readIndent
			let indent = this.readIndent(str.slice(lineStart, lineEnd))
			let indentPos = lineStart + indent * tabLen

			// Skip patterns
			if (skip.length > 0) {
				const raw = str.slice(lineStart, lineEnd)
				if (skip.some((s) => (typeof s === 'function' ? s(raw) : s === raw))) continue
			}

			// Extract only when necessary (or use pointer-based logic in callback)
			const content = str.slice(indentPos, lineEnd).trimEnd()
			callback(content, indent, lineNumCurrent, indentPos, lineEnd, str, lines)
		}
	}

	/**
	 * Stringify the generic tree.
	 * @param {Node} node
	 * @param {object} options
	 * @param {number} [options.indent=0]
	 * @returns {string}
	 */
	encode(node, options = {}) {
		const { indent = 0 } = options
		const line = `${this.tab.repeat(indent)}${node.content}`
		if (!node.children || node.children.length === 0) {
			return line
		}
		const childLines = node.children
			.map((child) => this.encode(child, { indent: indent + 1 }))
			.join(this.eol)
		return `${line}${this.eol}${childLines}`
	}

	/**
	 * @param {Node} node
	 * @returns {string}
	 */
	stringify(node) {
		return node.toString({ tab: this.tab, eol: this.eol })
	}

	static findTab(str, tabs = [4, 2, '\t'], eol = '\n') {
		const arr = str.split(eol)
		const map = new Map(tabs.map((t) => ['number' === typeof t ? ' '.repeat(t) : t, 0]))
		arr.forEach((row) => {
			for (const key of map.keys()) {
				if (row.startsWith(key)) {
					map.set(key, (map.get(key) ?? 0) + 1)
				}
			}
		})
		const entries = Array.from(map.entries())
		entries.sort((a, b) => b[1] - a[1])
		return entries[0]?.[0] ?? '\t'
	}
}
