import XMLTransformer, { nano2xml } from '@nan0web/xml'
import HTMLTags from './HTMLTags.js'

/**
 * Class representing an HTML transformer.
 *
 * Encodes nano objects to HTML format, and decodes HTML strings to nano objects.
 *
 * @class HTMLTransformer
 * @extends XMLTransformer
 */
export default class HTMLTransformer extends XMLTransformer {
	/**
	 * Creates a new HTMLTransformer instance.
	 *
	 * @param {Object} [options={}]
	 * @param {string} [options.tab='\t'] - Indentation string.
	 * @param {string} [options.eol='\n'] - End‑of‑line string.
	 * @param {HTMLTags} [options.defaultTags] - Tag mapping configuration.
	 */
	constructor(options = {}) {
		const { defaultTags = new HTMLTags() } = options
		// Pass options to the parent constructor; XMLTransformer will set tab/eol.
		// @ts-ignore
		super({ ...options, defaultTags })
	}

	/**
	 * Encodes a nano object to HTML.
	 *
	 * @param {Object|Array} data - Nano structure.
	 * @returns {Promise<string>} HTML string.
	 */
	async encode(data) {
		// Use nano2xml with the HTML‑specific tag configuration.
		// No custom serializeAttributes or $escapeText needed – nano2xml handles
		// attribute ordering and primitive escaping internally.
		return nano2xml(data, {
			indent: this.tab,
			newLine: this.eol,
			defaultTags: this.defaultTags,
		})
	}

	/**
	 * Decodes an HTML string to a nano object.
	 *
	 * Currently not implemented.
	 *
	 * @param {string} str - HTML string.
	 * @throws {Error} Always throws as the method is a placeholder.
	 */
	async decode(str) {
		throw new Error('HTMLTransformer.decode() is not implemented yet')
	}
}
