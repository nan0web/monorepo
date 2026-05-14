import MDElement from './MDElement.js'

/**
 * @typedef {Object} MDHeadingProps
 * @property {number} [heading=0]
 */

/**
 * Heading element.
 */
export default class MDHeading extends MDElement {
	/** @type {string | ((el: MDHeading) => string)} */
	static get defaultTag() {
		return (el) => `<h${el.heading || 1}>`
	}
	/** @type {string | ((el: MDHeading) => string)} */
	static get defaultEnd() {
		return (el) => `</h${el.heading || 1}>`
	}
	/** @type {string | ((el: MDHeading) => string)} */
	static get defaultMdTag() {
		return (el) => '#'.repeat(el.heading || 1) + ' '
	}
	/** @type {string | ((el: MDHeading) => string)} */
	static get defaultMdEnd() {
		return '\n'
	}

	/** @type {number} */
	heading

	/**
	 *
	 * @param {import("./MDElement.js").MDElementProps & MDHeadingProps} [props]
	 */
	constructor(props = {}) {
		super(props)
		let { heading = 0 } = props
		if (!heading) {
			heading = String('function' === typeof this.mdTag ? this.mdTag(this) : this.mdTag).length - 1
		}
		this.heading = Number(heading)
	}

	/**
	 * @param {object} input
	 * @returns {MDHeading}
	 */
	static from(input) {
		if (input instanceof MDHeading) return input
		return new MDHeading(input)
	}

	/**
	 * Parses a heading from markdown text.
	 * @param {string} text
	 * @returns {MDHeading|false}
	 */
	static parse(text) {
		const match = text.match(/^(\#{1,6})\s+(.*)$/)
		if (!match) {
			return false
		}
		const heading = match[1].length ?? 1
		const content = match[2]
		return new MDHeading({ content, heading })
	}
}
