import { resolve } from 'node:path'
import Attachment from './Attachment.js'
import Address from './Address.js'
import Target from './Target.js'
import { replace } from './placeholders.js'

class Email {
	/** @type {string} */
	subject
	/** @type {string} */
	html
	/** @type {object} */
	fields
	/** @type {Address} */
	from
	/** @type {Target} */
	target
	/** @type {string} */
	style
	/** @type {string|null} */
	dir
	/** @type {array} */
	attachments
	/** @type {string} */
	text

	/**
	 * @param {object} input
	 * @param {string} [input.subject]
	 * @param {string} [input.html]
	 * @param {object} [input.fields]
	 * @param {string} [input.from]
	 * @param {string} [input.target]
	 * @param {string} [input.to]
	 * @param {string} [input.style]
	 * @param {string|null} [input.dir]
	 * @param {array} [input.attachments]
	 * @param {string} [input.text] - Optional plain‑text version of the e‑mail.
	 */
	constructor(input = {}) {
		const {
			subject = '',
			html = '',
			fields = {},
			from = '',
			to = '',
			target = '',
			style = '',
			dir = null,
			attachments = [],
			text = '',
		} = input
		this.subject = String(subject)
		this.html = html
		this.fields = fields
		this.from = Address.from(from)
		this.target = Target.from(to && !target ? to : target)
		this.style = String(style)
		this.dir = dir
		this.attachments = []
		this.text = String(text)
		this.attach(attachments)
	}

	#relativeAttachment(attachment) {
		const a = Attachment.from(attachment)
		if (this.dir && String(a.path).startsWith('.')) {
			a.path = resolve(this.dir, a.path)
		}
		return a
	}

	/**
	 * Adds an attachment to the email.
	 * @param {Attachment|Array<Attachment>} attachment - The attachment object.
	 */
	attach(attachment) {
		if (Array.isArray(attachment)) {
			attachment.forEach((a) => this.attach(a))
		} else {
			this.attachments.push(this.#relativeAttachment(attachment))
		}
	}

	/**
	 * Formats the email object for nodemailer.
	 * @returns {object} - The formatted object for nodemailer.
	 */
	formatForNodemailer(replacements = {}, replacer = replace) {
		return {
			from: replacer(`${this.from}`, replacements),
			to: replacer(this.target?.formatForNodemailer().to, replacements),
			cc: replacer(this.target?.formatForNodemailer().cc, replacements),
			bcc: replacer(this.target?.formatForNodemailer().bcc, replacements),
			subject: replacer(this.subject, replacements),
			html: replacer(this.html, replacements),
			attachments: this.attachments.map((att) => att.formatForNodemailer(replacements, replacer)),
		}
	}

	/**
	 * Creates or returns the same Email if input is such instance.
	 * @param {object} input
	 * @returns {Email}
	 */
	static from(input) {
		if (input instanceof Email) return input
		return new Email(input)
	}
}

export default Email
