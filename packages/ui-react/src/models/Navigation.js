import { ContainerObject } from "@nan0web/types"

class Navigation extends ContainerObject {
	/** @type {string} */
	href
	/** @type {string} */
	title
	/** @type {string} */
	img
	/** @type {string} */
	icon
	/** @type {string} */
	$class
	/** @type {boolean} */
	disabled
	/** @type {Navigation[]} */
	children

	/**
	 * @param {object} input
	 * @param {string} [input.href]
	 * @param {string} [input.img]
	 * @param {string} [input.icon]
	 * @param {string} [input.title]
	 * @param {string} [input.$class]
	 * @param {boolean} [input.disabled=false]
	 * @param {Navigation[]} [input.children]
	 */
	constructor(input = {}) {
		super()
		if ("string" === typeof input) {
			input = { href: input }
		}
		if (Array.isArray(input)) {
			input = { children: input }
		}
		const {
			href = "",
			img = "",
			icon = "",
			title = "",
			$class = "",
			disabled = false,
			children = [],
		} = input
		this.href = String(href)
		this.img = String(img)
		this.icon = String(icon)
		this.title = String(title)
		this.$class = String($class)
		this.disabled = Boolean(disabled)
		this.children = children.map(item => Navigation.from(item))
	}

	/**
	 * @returns {string}
	 */
	get url() {
		return this.href.startsWith('/') ? this.href : ('/' + this.href)
	}

	/**
	 * @returns {boolean}
	 */
	get empty() {
		return ("" === this.href + this.title + this.img + this.icon) && 0 === this.children.length
	}

	/**
	 * @returns {number}
	 */
	get count() {
		return this.children.length
	}

	/**
	 * Checks if the current navigation item's href matches the given URI or is a parent folder of the URI.
	 * @param {string} uri - The URI to check against the navigation item's href.
	 * @returns {boolean} - `true` if the navigation item's href matches the URI or is a parent folder, otherwise `false`.
	 */
	isActive(uri) {
		if (!this.href || !uri) return false
		const href = this.href.startsWith('/') ? this.href.slice(1) : this.href
		const normalizedUri = uri.startsWith('/') ? uri.slice(1) : uri
		return normalizedUri === href || normalizedUri.startsWith(href + '/')
	}

	/**
	 * @param {string} uri
	 * @returns {Navigation | null}
	 */
	get(uri) {
		if (!uri) return null
		if (uri === this.href) return this

		for (const child of this.children) {
			const result = child.get(uri)
			if (result) return result
		}
		return null
	}

	toString() {
		const result = []
		if (this.icon) result.push(this.icon)
		if (this.title) result.push(this.title)
		if (this.href) result.push(`<${this.href}>`)
		if (this.disabled) result.push('(disabled)')
		return result.join(' ')
	}

	/**
	 * @param {string | URL} to
	 */
	isExternal(to) {
		try {
			const url = "string" === typeof to ? new URL(to, "http://localhost") : to
			const src = new URL(this.href, url.origin)
			const {
				hostname = "",
			} = url
			return ![src.hostname, "localhost"].includes(hostname)
		} catch (/** @type {any} */ err) {
			const str = String(to)
			if (str.startsWith("mailto:")) {
				const [hostname] = str.slice(7).split("@").slice(1).join("@").split(/[\?\&+]/)
				return this.isExternal("https://" + hostname)
			}
			console.warn(err.message, to)
			return true
		}
	}

	/**
	 * @param {object} input
	 * @returns {Navigation}
	 */
	static from(input = {}) {
		if (input instanceof Navigation) return input
		return new Navigation(input)
	}
}

export default Navigation
