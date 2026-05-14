/**
 * @file Element — the model of a declarative UI block.
 * Format: { Button: [...], $variant: 'info', $onClick: fn }
 * Framework-agnostic.
 */

export default class Element {
	/** @type {Record<string, string | ((val: any, key: string) => Record<string, any>)>} */
	static PROP_ALIASES = {
		$class: 'className',
		$for: 'htmlFor',
		$aria: (val, key) => ({
			[key
				.slice(1)
				.replace(/([A-Z])/g, '-$1')
				.toLowerCase()]: val,
		}), // $ariaLabel → aria-label
		$on: (val, key) => ({ [key.slice(1).toLowerCase()]: val }), // $onClick → onclick
	}

	/**
	 * The component type or HTML tag (e.g., "Button", "div")
	 * @type {string}
	 */
	type

	/**
	 * The content of the element.
	 * Can be:
	 *   - string → text
	 *   - true → empty
	 *   - array → nested blocks { Icon } or text nodes
	 * @type {string | true | any[]}
	 */
	content

	/**
	 * Props extracted from $-keys.
	 * For example, { $onClick: fn, $variant: 'info' } → { onClick: fn, variant: 'info' }
	 * @type {Object}
	 */
	props

	/**
	 * Creates an `Element` from a declarative block.
	 * @param {Object} input - For example, { Button: ["Click"], $variant: "primary" }
	 */
	constructor(input = {}) {
		const tags = Element.extractTags(input)
		const [type, content] = tags[0] || ['div', '']
		this.type = type
		this.content = content === true ? [] : content
		this.props = Element.extractProps(input, true, Element.parseProp.bind(Element))
	}

	/**
	 * Checks if the element contains nested elements (not only text).
	 * @returns {boolean}
	 */
	hasChildren() {
		return (
			Array.isArray(this.content) &&
			this.content.some((c) => typeof c === 'object' && !Array.isArray(c))
		)
	}

	/**
	 * Checks if the content contains text fragments.
	 * @returns {boolean}
	 */
	hasText() {
		return (
			typeof this.content === 'string' ||
			(Array.isArray(this.content) && this.content.some((c) => typeof c === 'string'))
		)
	}

	/**
	 * Returns an array of child elements (Element instances).
	 * @returns {Element[]}
	 */
	getChildElements() {
		if (!this.hasChildren()) return []
		return /** @type {any[]} */ (this.content)
			.filter((item) => typeof item === 'object' && item && !Array.isArray(item))
			.map((item) => Element.from(item))
	}

	/**
	 * Factory method to create or return an existing `Element`.
	 * @param {Object} input
	 * @returns {Element}
	 */
	static from(input) {
		if (input instanceof Element) return input
		return new Element(input)
	}

	/**
	 * Parses $-props.
	 * Converts for example:
	 *   - $style="color:red;font-size:14px" → { style: { color: 'red', 'font-size': '14px' } }
	 *   - $onClick=fn → { onClick: fn }
	 *   - $ariaHidden=true → { 'aria-hidden': true }
	 *
	 * @param {string} key - The name of the prop
	 * @param {any} value - The value of the prop
	 * @returns {Object} - An object { propName: newVal }
	 */
	static parseProp(key, value) {
		if (key === '$style' && typeof value === 'string') {
			return { style: this.parseInlineStyle(value) }
		}

		if (key.startsWith('$aria') && key.length > 5) {
			const ariaKey = key
				.slice(5)
				.replace(/([A-Z])/g, '$1')
				.toLowerCase()
			return { [`aria-${ariaKey}`]: value }
		}

		if (key.startsWith('$on') && key.length > 3) {
			return { [key.slice(1)]: value }
		}

		const propAlias = this.PROP_ALIASES[key]
		if (typeof propAlias === 'string') {
			return { [propAlias]: value }
		}

		if (typeof propAlias === 'function') {
			return propAlias(value, key)
		}

		if (key.startsWith('$')) {
			return { [key.slice(1)]: value }
		}

		return { [key]: value }
	}

	/**
	 * Parses an inline CSS style string.
	 * @param {string} styleStr
	 * @returns {Object}
	 */
	static parseInlineStyle(styleStr) {
		return styleStr.split(';').reduce((style, rule) => {
			const [key, val] = rule.trim().split(':')
			if (key && val) style[key.trim()] = val.trim()
			return style
		}, {})
	}

	/**
	 * Extracts $-props from the block.
	 * @param {Object} block
	 * @param {boolean} keep$ - Whether to keep the prefix `$`.
	 * @param {Function} [flatMap] - Function that transforms a key-value pair into a new key-value pair.
	 * @returns {Object}
	 */
	static extractProps(block, keep$ = false, flatMap = undefined) {
		const entries = Object.entries(block)
			.filter(([k]) => k.startsWith('$'))
			.map(([k, v]) => [keep$ ? k : k.slice(1), v])

		if (typeof flatMap === 'function') {
			return Object.fromEntries(entries.flatMap(([k, v]) => Object.entries(flatMap(k, v))))
		}

		return Object.fromEntries(entries)
	}

	/**
	 * Extracts tags (non-prefixed keys) from the block.
	 * @param {Object} block
	 * @returns {Array<[string, any]>}
	 */
	static extractTags(block) {
		return Object.entries(block).filter(([k]) => !k.startsWith('$'))
	}
}
