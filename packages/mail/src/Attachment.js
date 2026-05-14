import { replace } from './placeholders.js'

class Attachment {
	/** @type {string} */
	filename
	/** @type {string} */
	content
	/** @type {string} */
	path
	/** @type {string} */
	href
	/** @type {string} */
	httpHeaders
	/** @type {string} */
	contentType
	/** @type {string} */
	contentDisposition
	/** @type {string} */
	cid
	/** @type {string} */
	encoding
	/** @type {string} */
	headers
	/** @type {string} */
	raw

	/**
	 * @param {object} input
	 * @param {string} [input.filename]
	 * @param {string} [input.content]
	 * @param {string} [input.path]
	 * @param {string} [input.href]
	 * @param {string} [input.httpHeaders]
	 * @param {string} [input.contentType]
	 * @param {string} [input.contentDisposition]
	 * @param {string} [input.cid]
	 * @param {string} [input.encoding]
	 * @param {string} [input.headers]
	 * @param {string} [input.raw]
	 */
	constructor(input = {}) {
		const {
			filename = '',
			content = '',
			path = '',
			href = '',
			httpHeaders = '',
			contentType = '',
			contentDisposition = 'attachment',
			cid = '',
			encoding = '',
			headers = '',
			raw = '',
		} = input
		this.filename = String(filename)
		this.content = String(content)
		this.path = String(path)
		this.href = String(href)
		this.httpHeaders = String(httpHeaders)
		this.contentType = String(contentType)
		this.contentDisposition = String(contentDisposition)
		this.cid = String(cid)
		this.encoding = String(encoding)
		this.headers = String(headers)
		this.raw = String(raw)
	}

	/**
	 * Returns the attachment formatted for nodemailer.
	 * @param {object} replacements
	 * @param {Function} replacer
	 * @returns {object} - The formatted attachment for nodemailer.
	 */
	formatForNodemailer(replacements = {}, replacer = replace) {
		const attachment = {}
		if (this.filename) attachment.filename = replacer(this.filename, replacements)
		if (this.content) attachment.content = this.content
		if (this.path) attachment.path = replacer(this.path, replacements)
		if (this.href) attachment.href = replacer(this.href, replacements)
		if (this.httpHeaders) attachment.httpHeaders = this.httpHeaders
		if (this.contentType) attachment.contentType = this.contentType
		if (this.contentDisposition) attachment.contentDisposition = this.contentDisposition
		if (this.cid) attachment.cid = replacer(this.cid, replacements)
		if (this.encoding) attachment.encoding = this.encoding
		if (this.headers) attachment.headers = this.headers
		if (this.raw) attachment.raw = this.raw
		return attachment
	}

	/**
	 * @param {object} input
	 * @returns {Attachment}
	 */
	static from(input) {
		if (input instanceof Attachment) return input
		return new Attachment(input)
	}
}

export default Attachment
