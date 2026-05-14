import Navigation from "./Navigation.js"

export default class Document {
	/**
	 * Content configuration for the document page.
	 * @type {Array<Object>}
	 */
	/** @type {Array<Object>} */
	$content = []
	/** @type {string} */
	$lang = "en"
	/** @type {string|null} */
	$redirect = null
	/** @type {string|null} */
	$layout = null
	/** @type {boolean} */
	$hideTitle = false
	/** @type {string} */
	title = ""
	/** @type {string} */
	description = ""
	/** @type {Navigation} */
	nav = new Navigation()
	/** @type {Map<string, string>} */
	t = new Map()

	/**
	 * @param {object} [input]
	 * @param {Array<object>} [input.$content=[]]
	 * @param {string} [input.$lang="en"]
	 * @param {string} [input.$redirect=null]
	 * @param {string} [input.$layout=null]
	 * @param {string} [input.title=""]
	 * @param {string} [input.description=""]
	 * @param {any} [input.nav=new Navigation()]
	 * @param {any} [input.t=new Map()]
	 */
	constructor(input = {}) {
		Object.assign(this, input)
		const {
			$content = this.$content,
			$lang = this.$lang,
			$redirect = this.$redirect,
			$layout = this.$layout,
			title = this.title,
			description = this.description,
			nav = this.nav,
			t = this.t,
		} = input
		this.$content = Array.isArray($content) ? $content : []
		this.$lang = String($lang || 'en')
		this.$redirect = $redirect ? String($redirect) : null
		this.$layout = $layout ? String($layout) : null
		this.title = String(title || "")
		this.description = String(description || "")
		this.nav = Navigation.from(nav)
		this.t = new Map(Array.isArray(t) ? t : Object.entries(t))
	}

	/**
	 * @param {string} type
	 * @returns {Array<object>}
	 */
	getBlocksByType(type) {
		return this.$content.filter(block => block[type] !== undefined)
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
