import ContainerObject from '../Object/ContainerObject.js'

/**
 * ──  Generic tree node that every format will start from
 * ──  { content:string, children:Array<Node> }
 */
export default class Node extends ContainerObject {
	/** @type {string} The row content (node is a row) */
	content = ''
	/** @type {Node[]} Nested rows (with higher indents until next with the same or lower) */
	children = []
	/** @type {number} The indent value */
	indent = 0

	/**
	 * @param {Partial<Node>} [input={}]
	 */
	constructor(input = {}) {
		const { content = '', children = [], indent = 0 } = input
		super({ level: indent })
		this.content = String(content)
		this.indent = Number(indent)
		children.forEach((c) => this.add(c))
	}

	/**
	 * Adds element to the container.
	 * @param {Partial<Node>} element
	 * @returns {Node}
	 */
	add(element) {
		const el = Node.from(element)
		el.level = this.level + 1
		el.indent = this.indent + 1
		this.children.push(el)
		el._updateLevel()
		el._updateIndent?.()
		return this
	}

	/**
	 * Updates indent for all nested children recursively.
	 * @private
	 */
	_updateIndent() {
		for (const child of this.children) {
			if (child instanceof Node) {
				child.indent = this.indent + 1
				child._updateIndent()
			}
		}
	}

	/**
	 * Maps over children.
	 *
	 * @param {(value: Node, index: number, arr: Node[]) => any[]} callback
	 * @param {boolean} [recursively=false]
	 * @returns {Array}
	 */
	map(callback, recursively = false) {
		// @ts-ignore
		return super.map(callback, recursively)
	}

	/**
	 * @param {object} [input]
	 * @param {boolean} [input.trim=false]
	 * @param {string} [input.tab="\t"]
	 * @param {string} [input.eol="\n"]
	 * @returns
	 */
	toString({ trim = false, tab = '\t', eol = '\n' } = {}) {
		const prefix = trim ? '' : tab.repeat(this.indent)
		return [prefix + this.content, ...this.children.map((c) => c.toString({ trim, tab, eol }))]
			.filter(Boolean)
			.join(eol)
	}

	/**
	 * @param {any} input
	 * @returns {Node}
	 */
	static from(input) {
		if (input instanceof Node) return input
		return new Node(input)
	}
}
