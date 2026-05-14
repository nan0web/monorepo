import MDElement from './MDElement.js'

/** @typedef {import("./MDElement.js").MDElementProps} MDElementProps */

/**
 * Code block element.
 * @typedef {Object} MDCodeBlockProps
 * @property {string} [language]
 */
export default class MDCodeBlock extends MDElement {
	/** @type {((el: MDCodeBlock) => string)} */
	static get defaultTag() {
		return (el) => `<pre>${el.language ? `<code class="language-${el.language}">` : ''}`
	}
	/** @type {((el: MDCodeBlock) => string)} */
	static get defaultMdTag() {
		return (el) => `\`\`\`${el.language}\n`
	}
	/** @type {string} */
	static get defaultMdEnd() {
		return '\n```\n'
	}
	/** @type {((el: MDCodeBlock) => string)} */
	static get defaultEnd() {
		return (el) => `${el.language ? `</code>` : ''}</pre>`
	}

	/** @type {string} */
	language

	/**
	 * @param {MDCodeBlockProps & MDElementProps} props
	 */
	constructor(props = {}) {
		super(props)
		const { language = '', content = '' } = props
		this.language = String(language)
		this.content = String(content)
	}

	/**
	 * Parses a code block from markdown text.
	 * @param {string} text
	 * @param {{i?: number, rows?: string[]}} context
	 * @returns {MDCodeBlock|false}
	 */
	static parse(text, context = { i: 0, rows: [] }) {
		const { i = 0, rows = [] } = context
		const match = text.match(/^```\s*(.*?)\s*$/)
		if (!match) {
			return false
		}
		const language = match[1]
		let j = i + 1

		const contentLines = []
		while (j < rows.length && !rows[j].startsWith('```')) {
			contentLines.push(rows[j])
			j++
		}

		if (j >= rows.length) {
			return false // Missing closing ```
		}

		const content = contentLines.join('\n')

		context.i = j + 1
		return new MDCodeBlock({
			language,
			content,
		})
	}
}
