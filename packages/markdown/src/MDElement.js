import { ContainerObject } from '@nan0web/types'

/**
 * Base class for markdown elements.
 * @typedef {Object} MDElementProps
 * @property {string} [content]
 * @property {string|Function} [tag]
 * @property {string|Function} [end]
 * @property {string|Function} [mdTag]
 * @property {string|Function} [mdEnd]
 * @property {MDElement[]} [children]
 */
export default class MDElement extends ContainerObject {
	static TAG_MARKDOWN = ''
	/** @type {string|Function} */
	static defaultMdTag = ''
	/** @type {string|Function} */
	static defaultMdEnd = ''
	/** @type {string|Function} */
	static defaultTag = ''
	/** @type {string|Function} */
	static defaultEnd = ''

	/** @type {string} */
	content
	/** @type {string|Function} */
	mdTag
	/** @type {string|Function} */
	mdEnd
	/** @type {string|Function} */
	tag
	/** @type {string|Function} */
	end
	/** @type {MDElement[]} */
	children = []

	/**
	 * @param {MDElementProps} props
	 */
	constructor(props = {}) {
		if ('string' === typeof props) {
			props = { content: props }
		}
		super(props)
		const {
			content = '',
			tag = /** @type {typeof MDElement} */ (this.constructor).defaultTag,
			end = /** @type {typeof MDElement} */ (this.constructor).defaultEnd,
			mdTag = /** @type {typeof MDElement} */ (this.constructor).defaultMdTag,
			mdEnd = /** @type {typeof MDElement} */ (this.constructor).defaultMdEnd,
			children = [],
		} = props
		this.content = String(content)
		this.tag = tag
		this.end = end
		this.mdTag = mdTag
		this.mdEnd = mdEnd
		children.map((child) => {
			if (!(child instanceof MDElement)) {
				throw new Error('Every child must be an instance of MDElement')
			}
		})
		this.children = children
	}

	get empty() {
		return 0 === this.content.length + this.children.length
	}

	/**
	 * Returns the most recent (deepest) container.
	 *
	 * @returns {MDElement}
	 */
	get recent() {
		return MDElement.from(super.recent)
	}

	renderTag() {
		return ('function' === typeof this.tag ? this.tag : () => this.tag)(this)
	}

	renderEnd() {
		return ('function' === typeof this.end ? this.end : () => this.end)(this)
	}

	renderMdTag() {
		return ('function' === typeof this.mdTag ? this.mdTag : () => this.mdTag)(this)
	}

	renderMdEnd() {
		return ('function' === typeof this.mdEnd ? this.mdEnd : () => this.mdEnd)(this)
	}

	/**
	 * Removes the element from the container.
	 * @param {MDElement} element
	 * @returns {this}
	 */
	remove(element) {
		return super.remove(element)
	}

	/**
	 * Finds an element by filter.
	 *
	 * @param {(v:MDElement) => boolean} filter
	 * @param {boolean} [recursively=false]
	 * @returns {*}
	 */
	find(filter, recursively = false) {
		return super.find(filter, recursively)
	}

	/**
	 * Flattens the tree into an array.
	 *
	 * @returns {MDElement[]}
	 */
	flat() {
		return super.flat().map((el) => MDElement.from(el))
	}

	toArray() {
		return super.toArray().map((el) => MDElement.from(el))
	}

	/**
	 * Filters children.
	 *
	 * @param {(v:MDElement) => boolean} [filter=()=>true]
	 * @param {boolean} [recursively=false]
	 * @returns {MDElement[]}
	 */
	filter(filter, recursively = false) {
		return super.filter(filter, recursively).map((el) => MDElement.from(el))
	}

	/**
	 * Maps over children.
	 *
	 * @param {(value: MDElement, index: number, arr: MDElement[]) => any} callback
	 * @param {boolean} [recursively=false]
	 * @returns {Array}
	 */
	map(callback, recursively = false) {
		// @ts-ignore MDElement extends ContainerObject
		return super.map(callback, recursively)
	}

	/**
	 * Asynchronously maps over children.
	 *
	 * @param {(value: MDElement, index: number, arr: MDElement[]) => Promise<any>} callback
	 * @param {boolean} [recursively=false]
	 * @returns {Promise<Array>}
	 */
	async asyncMap(callback, recursively = false) {
		// @ts-ignore MDElement extends ContainerObject
		return await super.asyncMap(callback, recursively)
	}

	/**
	 * @throws
	 * @param {MDElement} element Element to add.
	 * @return {this} The current instance.
	 */
	add(element) {
		if (!(element instanceof MDElement)) {
			throw new TypeError('Only markdown elements can be added to markdown document')
		}
		super.add(element)
		return this
	}

	/**
	 * Convert element and children to string with indentation.
	 * @param {object} props
	 * @param {number} [props.indent=-2]
	 * @param {string} [props.tab="  "]
	 * @param {string} [props.format=".md"]
	 * @returns {string}
	 */
	toString(props = {}) {
		const { indent = -2, tab = '  ', format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML(props)
		}
		if ('.txt' === format) {
			return this.toTEXT(props)
		}

		const contentLine = this.renderMdTag() + this.content + this.renderMdEnd()
		const childrenLines = this.children.map((child) =>
			child.toString({ indent: indent + tab.length, format }),
		)
		return [contentLine, ...childrenLines].filter((s) => '' !== s).join('')
	}

	/**
	 * Process content for inline elements (links, code, etc.)
	 * @param {string} text
	 * @param {string} [format=".md"]
	 * @returns {string}
	 */
	static processInline(text, format = '.md') {
		if (!text) return ''
		let processed = text

		if ('.html' === format) {
			// Code must come before links to avoid issues with backticks inside links
			processed = processed.replace(/`([^`]*)`/g, '<code>$1</code>')
			// Match bold **text** or __text__
			processed = processed.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
			processed = processed.replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
			// Match italic *text* or _text_
			processed = processed.replace(/\*([\s\S]+?)\*/g, '<em>$1</em>')
			processed = processed.replace(/_([\s\S]+?)_/g, '<em>$1</em>')
			// Match strikethrough ~~text~~
			processed = processed.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>')
			// Match [text](href)
			processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
		}
		return processed
	}

	/**
	 * Convert element and children to HTML string with indentation.
	 * @param {object} props
	 * @param {number} [props.indent=0]
	 * @returns {string}
	 */
	toHTML(props = {}) {
		const { indent = 0 } = props
		const indentStr = ' '.repeat(indent)

		const content = MDElement.processInline(this.content, '.html')

		const childrenHTML = this.children.map((child) => child.toHTML({ indent: indent + 2 })).join('\n')

		let output = indentStr + this.renderTag()
		if (content) output += content
		if (childrenHTML) output += '\n' + childrenHTML + '\n' + indentStr
		output += this.renderEnd()

		return output
	}

	/**
	 * Convert element and children to TEXT string with indentation.
	 * @param {object} props
	 * @param {number} [props.indent=0]
	 * @param {string} [props.tag=""]
	 * @param {string} [props.end=""]
	 * @returns {string}
	 */
	toTEXT(props = {}) {
		const { indent = 0, tag = '', end = '' } = props
		const indentStr = ' '.repeat(indent)
		const contentLine = indentStr + tag + this.content + end
		const childrenLines = this.children.map((child) => child.toHTML({ indent: indent + 2 }))
		return [contentLine, ...childrenLines].join('\n')
	}

	/**
	 * Create an element from a props object or string.
	 * @param {MDElement | object | string} input
	 * @returns {MDElement}
	 */
	static from(input) {
		if (input instanceof MDElement) return input
		return new this(input)
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toString()
	}
}
