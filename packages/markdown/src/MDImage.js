import MDElement from './MDElement.js'

/**
 * Image element.
 */
export default class MDImage extends MDElement {
	static get defaultTag() {
		return '<img'
	}
	static get defaultMdTag() {
		return '!'
	}
	static get defaultMdEnd() {
		return ' '
	}
	static get defaultEnd() {
		return '>'
	}

	/** @type {string} */
	src

	/**
	 * @param {object} props
	 */
	constructor(props = {}) {
		super(props)
		const { src = '' } = props
		this.src = src
	}

	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML(props)
		}
		return ' '.repeat(indent) + `${this.mdTag}[${this.content}](${this.src})${this.mdEnd}`
	}

	toHTML(props = {}) {
		const { indent = 0 } = props
		return ' '.repeat(indent) + `${this.tag} src="${this.src}" alt="${this.content}"${this.end}`
	}

	static parse(text, context = {}) {
		let { i = 0, rows = [] } = context
		const match = text.match(/^!\[(.*?)\]\((.*?)\)$/)
		if (!match) {
			return false
		}
		const content = match[1]
		const src = match[2]
		i = i + match[0].length
		return new MDImage({
			content,
			src,
		})
	}
}
