import DB from '@nan0web/db-browser'
const components = new Map()

/**
 * Main Lit UI application component
 *
 * @param {Object} props
 * @param {DB} props.db - Database instance
 * @param {string} props.documentPath - Path to document
 * @param {Map<string, CustomElementConstructor>} props.components - Component registry
 */
export default class UILit extends HTMLElement {
	constructor(props = {}) {
		super()
		this.db = props.db
		this.documentPath = props.documentPath || 'index.json'
		this.components = props.components || new Map()
		this.document = new Document({})
	}

	async connectedCallback() {
		await this.loadDocument()
		this.render()
	}

	async loadDocument() {
		const data = await this.db.fetch(this.documentPath)
		this.document = Document.from(data)
	}

	render() {
		this.innerHTML = ''
		this.document.$content.forEach((item) => {
			const el = this._renderItem(item)
			if (el) this.appendChild(el)
		})
	}

	_renderItem(item) {
		if (item === null || item === undefined) return null
		if (typeof item === 'string' || typeof item === 'number') {
			return document.createTextNode(String(item))
		}

		let type = item.type
		let data = item.data || item.content || item.$content
		const props = item.props || {}

		// Extract type automatically if not specified (like YAML { h1: 'text' })
		if (!type) {
			const keys = Object.keys(item).filter(
				(k) => k !== 'props' && k !== 'data' && !k.startsWith('$'),
			)
			if (keys.length > 0) {
				type = keys[0]
				data = item[type]
			} else {
				// Fallback generic block
				type = 'div'
			}
		}

		// Check if it's a registered Web Component
		const ComponentClass = this.components.get(type) || this.components.get(type.toLowerCase())
		if (ComponentClass) {
			const component = new ComponentClass()
			component.db = this.db
			Object.assign(component, props)
			if (data !== undefined) component.data = data
			return component
		}

		// Otherwise, render a standard HTML tag
		const el = document.createElement(type)
		Object.assign(el, props)

		// Handle $-prefixed YAML attributes (like $class, $href, $target)
		for (const [key, val] of Object.entries(item)) {
			if (key.startsWith('$') && key !== '$content') {
				const attrName = key.slice(1)
				if (attrName === 'class') {
					el.className = String(val)
				} else if (Array.isArray(val)) {
					el.setAttribute(attrName, val.join(' '))
				} else {
					el.setAttribute(attrName, String(val))
				}
			}
		}

		if (Array.isArray(data)) {
			data.forEach((child) => {
				const childEl = this._renderItem(child)
				if (childEl) el.appendChild(childEl)
			})
		} else if (typeof data === 'object' && data !== null) {
			const childEl = this._renderItem(data)
			if (childEl) el.appendChild(childEl)
		} else if (data !== undefined && data !== null) {
			if (typeof data === 'string' && data.includes('<') && data.includes('>')) {
				el.innerHTML = data
			} else {
				el.textContent = String(data)
			}
		}

		return el
	}
}

// Helper class for document structure
class Document {
	/** @type {Array<object>} */
	$content = []

	/**
	 * @param {object} [input]
	 * @param {Array<object>} [input.$content=[]]
	 */
	constructor(input = {}) {
		const { $content = [] } = input
		this.$content = $content
	}

	/**
	 * @param {object} input
	 * @returns {Document}
	 */
	static from(input) {
		if (input instanceof Document) return input
		return new Document(input)
	}
}

// Export components registry
export { components }
export const componentsRegistry = components
