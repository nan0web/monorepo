import MDElement from './MDElement.js'

/**
 * Link element.
 */
export default class MDLink extends MDElement {
	/** @type {string} */
	static get defaultTag() {
		return '<a'
	}
	static get defaultMdTag() {
		return '['
	}
	static get defaultMdEnd() {
		return ']('
	}
	static get defaultEnd() {
		return '</a>'
	}

	/** @type {string} */
	href

	/**
	 * @param {object} props
	 */
	constructor(props = {}) {
		super(props)
		const { href = '' } = props
		this.href = href
	}

	toHTML(props = {}) {
		const { indent = 0 } = props
		const content = MDElement.processInline(this.content, '.html')
		return ' '.repeat(indent) + `${this.tag} href="${this.href}">${content}${this.end}`
	}

	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML(props)
		}
		return ' '.repeat(indent) + `${this.mdTag}${this.content}${this.mdEnd}${this.href})`
	}

	/**
	 *
	 * @param {string} text
	 * @param {{ i:number, rows:string[] }} [context]
	 * @returns {MDLink|false}
	 */
	static parse(text, context = { i: 0, rows: [] }) {
		const { i = 0, rows = [] } = context
		const match = text.match(/^\[(.*?)\]\((.*?)\)$/)
		if (!match) {
			return false
		}
		const content = match[1]
		const href = match[2]
		// Update context position (not used elsewhere but keeps parity with other parsers)
		context.i = i + 1
		return new MDLink({
			content,
			href,
		})
	}
}
