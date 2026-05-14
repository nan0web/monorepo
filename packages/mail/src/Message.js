import { Message } from '@nan0web/co'
import Attachment from './Attachment.js'
import Address from './Address.js'

export default class MailMessage extends Message {
	/** @type {Address} */
	from
	/** @type {Address} */
	to
	/** @type {string | null} */
	dir
	/** @type {Array<Attachment>} */
	attachments

	/**
	 * @param {object} input
	 * @param {string} [input.body]
	 * @param {Date} [input.time]
	 * @param {string|Address} [input.from]
	 * @param {string|Address} [input.to]
	 * @param {string} [input.dir]
	 * @param {Array<Attachment>} [input.attachments]
	 */
	constructor(input) {
		super(input)
		const { from = '', to = '', dir = null, attachments = [] } = input
		this.from = Address.from(from)
		this.to = Address.from(to)
		this.dir = dir
		this.attachments = []
		this.attach(attachments)
	}

	/**
	 * Adds an attachment to the email.
	 * @param {Attachment|Array<Attachment>} attachment - The attachment object.
	 */
	attach(attachment) {
		if (Array.isArray(attachment)) {
			attachment.forEach((a) => this.attach(a))
		} else {
			this.attachments.push(Attachment.from(attachment))
		}
	}
}
