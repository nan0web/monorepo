import Transformer from '@nan0web/transformer'
import XMLTags from './XMLTags.js'
import nano2xml from './nano2xml.js'
import xml2nano from './xml2nano.js'

/**
 * Class representing an XML transformer.
 * Encodes nan•objects to XML format, and decodes XML strings to nan•objects.
 * @extends Transformer
 */
export default class XMLTransformer extends Transformer {
	/** @type {string} */
	tab
	/** @type {string} */
	eol
	/** @type {XMLTags} */
	defaultTags

	/**
	 * Creates a new XMLTransformer instance.
	 * @param {Object} [options={}] - Options for XML conversion.
	 * @param {string} [options.tab='\t'] - The string to use for indentation.
	 * @param {string} [options.eol='\n'] - The string to use for new lines.
	 * @param {XMLTags} [options.defaultTags] - The default tag mappings for conversion.
	 */
	constructor(options = {}) {
		super()
		const { tab = '\t', eol = '\n', defaultTags = new XMLTags() } = options
		this.tab = String(tab)
		this.eol = String(eol)
		this.defaultTags = defaultTags
	}

	/**
	 * Encodes a nan•object to XML format.
	 * @param {Object|Array} data - The nan•object or array to encode.
	 * @returns {Promise<string>} - The XML string representation.
	 */
	async encode(data) {
		return nano2xml(data, { indent: this.tab, newLine: this.eol, defaultTags: this.defaultTags })
	}

	/**
	 * Decodes an XML string to a nan•object.
	 * @param {string} str - The XML string to decode.
	 * @returns {Promise<Object|Array>} - The decoded nan•object or array.
	 */
	async decode(str) {
		return xml2nano(str)
	}
}
