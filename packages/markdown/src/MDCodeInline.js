import MDElement from './MDElement.js'

/**
 * Inline code element.
 */
export default class MDCodeInline extends MDElement {
	/** @type {string} */
	static get defaultTag() {
		return '<code>'
	}
	/** @type {string} */
	static get defaultMdTag() {
		return '`'
	}
	/** @type {string} */
	static get defaultMdEnd() {
		return '`'
	}
	/** @type {string} */
	static get defaultEnd() {
		return '</code>'
	}

	/**
	 * @param {string} text
	 * @param {object} context
	 * @returns {MDCodeInline|false}
	 */
	static parse(text, context = {}) {
		const match = text.match(/`([^`]*)`/)
		if (!match) {
			return false
		}
		const content = match[1]
		return new MDCodeInline({ content })
	}
}
