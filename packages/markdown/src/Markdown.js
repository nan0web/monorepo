import MDElement from './MDElement.js'
import MDParagraph from './MDParagraph.js'
import MDHeading1 from './MDHeading1.js'
import MDHeading2 from './MDHeading2.js'
import MDHeading3 from './MDHeading3.js'
import MDHeading4 from './MDHeading4.js'
import MDHeading5 from './MDHeading5.js'
import MDHeading6 from './MDHeading6.js'
import MDOrderedList from './MDOrderedList.js'
import MDList from './MDList.js'
import MDListItem from './MDListItem.js'
import MDCodeBlock from './MDCodeBlock.js'
import MDCodeInline from './MDCodeInline.js'
import MDLink from './MDLink.js'
import MDImage from './MDImage.js'
import MDBlockquote from './MDBlockquote.js'
import MDHorizontalRule from './MDHorizontalRule.js'
import MDSpace from './MDSpace.js'
import MDTable from './MDTable.js'
import MDTableRow from './MDTableRow.js'
import MDTableCell from './MDTableCell.js'
import MDTaskList from './MDTaskList.js'
import ParseContext from './Parse/Context.js'
import InterceptorInput from './InterceptorInput.js'

/**
 * Markdown parser for nanoweb.
 * Parses markdown to object by new lines.
 * @link https://www.markdownguide.org/cheat-sheet/
 */
export default class Markdown {
	static ELEMENTS = [
		// Block elements
		MDHeading1,
		MDHeading2,
		MDHeading3,
		MDHeading4,
		MDHeading5,
		MDHeading6,
		MDOrderedList,
		MDList,
		MDListItem,
		MDBlockquote,
		MDHorizontalRule,
		MDTable,
		MDTableRow,
		MDTableCell,
		MDCodeBlock,
		MDTaskList,
		MDParagraph,
		// Inline elements
		MDCodeInline,
		MDLink,
		MDImage,
		// Space elements
		MDSpace,
	]

	/** @type {MDElement} */
	document

	/**
	 * @param {Partial<Markdown> | string} [input]
	 */
	constructor(input = {}) {
		if ('string' === typeof input) {
			input = { document: new MDElement({ children: Markdown.parse(input) }) }
		}
		const { document = new MDElement() } = input
		this.document = document
	}

	/**
	 * Proxies to document.add()
	 * @param {MDElement} element
	 * @returns {this}
	 */
	add(element) {
		this.document.add(element)
		return this
	}

	/**
	 * Writes content to the document.
	 * @param {string} content
	 * @param {string|Function} [tag='p'] - MD element tag or type
	 * @returns {this}
	 */
	write(content, tag = 'p') {
		const mapping = {
			'p': MDParagraph,
			'h1': MDHeading1,
			'h2': MDHeading2,
			'h3': MDHeading3,
			'h4': MDHeading4,
			'h5': MDHeading5,
			'h6': MDHeading6,
			'blockquote': MDBlockquote,
			'hr': MDHorizontalRule,
		}

		const tagName = 'string' === typeof tag ? tag.toLowerCase() : ''
		const ElementClass = mapping[tagName] || MDParagraph
		this.add(new ElementClass({ content }))
		return this
	}

	/**
	 * Writes a table to the document.
	 * @param {Array<Object|Array<string|number>>} data - Tabular data
	 * @returns {this}
	 */
	table(data) {
		if (!data || data.length === 0) return this

		let rows = []

		if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
			const keys = Object.keys(data[0])
			rows.push(keys)
			for (const item of data) {
				rows.push(keys.map(key => item[key] ?? ''))
			}
		} else {
			rows = data
		}

		// 1. Construct rows with cells
		const mdRows = rows.map((rowData) => {
			const cells = rowData.map(cell => new MDTableCell({ content: String(cell) }))
			return new MDTableRow({ children: cells })
		})

		// 2. Add separator after header
		if (mdRows.length > 0) {
			const colCount = rows[0].length
			const separatorCells = Array(colCount).fill(0).map(() => new MDTableCell({ content: '---' }))
			mdRows.splice(1, 0, new MDTableRow({ children: separatorCells }))
		}

		this.add(new MDTable({ children: mdRows, mdTag: '', mdEnd: '' }))
		return this
	}

	/**
	 * Returns markdown string representation.
	 * @returns {string}
	 */
	toString() {
		return this.document.toString()
	}

	/**
	 * Parse markdown text into elements.
	 * @param {string} text
	 * @returns {MDElement[]} - Root element children
	 */
	parse(text) {
		this.document.children = Markdown.parse(text)
		return this.document.children
	}

	/**
	 * Parse markdown text into elements.
	 * @param {string} text
	 * @returns {MDElement[]} - Root element children
	 */
	static parse(text) {
		const lines = String(text).split('\n')
		const elements = []
		let i = 0
		while (i < lines.length) {
			let line = lines[i]
			let parsed = null
			const context = new ParseContext({ i, rows: lines })
			for (const Element of Markdown.ELEMENTS) {
				if ('function' !== typeof Element.parse) {
					throw new Error(`Element ${Element.name} has no static parse() method`)
				}
				parsed = Element.parse(line, context)
				if (parsed) break
				context.skipped.push(Element)
			}
			if (parsed && parsed.constructor && parsed.constructor.name === 'MDCodeBlock') {
				// Find end of code block
				let j = i + 1
				while (j < lines.length && !lines[j].startsWith('```')) {
					j++
				}
				j++ // skip closing ```
				i = j
			} else if (parsed && parsed.constructor && parsed.constructor.name === 'MDBlockquote') {
				// Find end of blockquote
				let j = i
				while (j < lines.length && lines[j].startsWith('>')) {
					j++
				}
				i = j
			} else if (
				parsed instanceof MDList ||
				parsed instanceof MDTaskList ||
				parsed instanceof MDOrderedList
			) {
				// Parse consecutive list items into a container
				const listType = parsed.constructor
				const ordered = !!parsed.ordered
				// @ts-ignore
				const list = new listType({ ordered, children: [] })
				while (i < lines.length) {
					const itemLine = lines[i]
					const itemParsed = MDListItem.parse(itemLine)
					if (!itemParsed) break
					list.add(itemParsed)
					i++
				}
				elements.push(list)
				continue
			} else if (!parsed) {
				// fallback to paragraph
				const paragraphLines = []
				let j = i
				while (j < lines.length && lines[j].trim() !== '') {
					paragraphLines.push(lines[j])
					j++
				}
				const paragraphContent = paragraphLines.join('\n')
				if (paragraphContent.trim() !== '') {
					parsed = new MDParagraph({ content: paragraphContent })
				} else {
					parsed = new MDSpace({ content: lines[i] + '\n' })
				}
				i = j > i ? j : i + 1
			} else {
				i = context.i === i ? i + 1 : context.i
			}
			if (parsed) {
				elements.push(parsed)
			} else {
				i++
			}
		}
		return elements
	}

	/**
	 * Stringify elements to HTML string.
	 * @param {(element: InterceptorInput) => string | null} [interceptor]
	 * @returns {string}
	 */
	stringify(interceptor) {
		const path = []
		const htmlParts = this.document.map((el) => {
			if (interceptor) {
				const input = new InterceptorInput({ element: el, path })
				const intercepted = interceptor(input)
				path.push(el)
				if (typeof intercepted === 'string') return intercepted
			}
			return el.toHTML({ indent: 0 })
		})
		return htmlParts.filter(Boolean).join('\n')
	}

	/**
	 * Stringify elements to HTML string.
	 * @param {(element: InterceptorInput) => Promise<string | null>} [interceptor]
	 * @returns {Promise<string>}
	 */
	async asyncStringify(interceptor) {
		const path = []
		const htmlParts = await this.document.asyncMap(async (el) => {
			if (interceptor) {
				const input = new InterceptorInput({ element: el, path })
				const intercepted = await interceptor(input)
				path.push(el)
				if (typeof intercepted === 'string') return intercepted
			}
			return el.toHTML({ indent: 0 })
		})
		return htmlParts.filter((p) => '' !== p).join('\n')
	}

	/**
	 * Convert element to HTML string.
	 * @param {MDElement} el
	 * @returns {string}
	 */
	elementToHTML(el) {
		if (
			el instanceof MDHeading1 ||
			el instanceof MDHeading2 ||
			el instanceof MDHeading3 ||
			el instanceof MDHeading4 ||
			el instanceof MDHeading5 ||
			el instanceof MDHeading6
		) {
			const tag = typeof el.tag === 'function' ? el.tag : el.tag
			const endTag = typeof el.end === 'function' ? el.end : el.end
			return `${typeof tag === 'function' ? tag(el) : tag}${el.content}${typeof endTag === 'function' ? endTag(el) : endTag}`
		}
		if (el instanceof MDParagraph) {
			return `<p>${el.content}</p>`
		}
		if (el instanceof MDList || el instanceof MDOrderedList) {
			const tag = el.ordered ? 'ol' : 'ul'
			const items = el.children.map((child) => `<li>${child.content}</li>`).join('')
			return `<${tag}>${items}</${tag}>`
		}
		if (el instanceof MDCodeBlock) {
			const langClass = el.language ? ` class="language-${el.language}"` : ''
			return `<pre><code${langClass}>${el.content}</code></pre>`
		}
		if (el instanceof MDBlockquote) {
			return `<blockquote>${el.content}</blockquote>`
		}
		if (el instanceof MDHorizontalRule) {
			return `<hr />`
		}
		// fallback to tag + content + end
		const tag = typeof el.tag === 'function' ? el.tag : el.tag
		const end = typeof el.end === 'function' ? el.end : el.end
		return (
			(typeof tag === 'function' ? tag(el) : tag) +
			el.content +
			(typeof end === 'function' ? end(el) : end)
		)
	}
}
