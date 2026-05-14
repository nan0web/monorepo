export default class MailMessage extends Message {
	/**
	 * @param {object} input
	 * @param {string} [input.body]
	 * @param {Date} [input.time]
	 * @param {string|Address} [input.from]
	 * @param {string|Address} [input.to]
	 * @param {string} [input.dir]
	 * @param {Array<Attachment>} [input.attachments]
	 */
	constructor(input: {
		body?: string | undefined
		time?: Date | undefined
		from?: string | Address | undefined
		to?: string | Address | undefined
		dir?: string | undefined
		attachments?: Attachment[] | undefined
	})
	/** @type {Address} */
	from: Address
	/** @type {Address} */
	to: Address
	/** @type {string | null} */
	dir: string | null
	/** @type {Array<Attachment>} */
	attachments: Array<Attachment>
	/**
	 * Adds an attachment to the email.
	 * @param {Attachment|Array<Attachment>} attachment - The attachment object.
	 */
	attach(attachment: Attachment | Array<Attachment>): void
}
import { Message } from '@nan0web/co'
import Address from './Address.js'
import Attachment from './Attachment.js'
