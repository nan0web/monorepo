import Message from './Message.js'

/**
 * @typedef {Object} OutputMessageInput
 * @property {string[]} [content=[]] - Content lines.
 * @property {any} [body] - Raw body (overrides *content* if provided).
 * @property {Record<string, any>} [head={}] - Additional metadata.
 * @property {Error|null} [error=null] - Associated error object.
 * @property {number} [priority=OutputMessage.PRIORITY.NORMAL] - Message priority.
 * @property {string} [type=OutputMessage.TYPES.INFO] - Message type.
 * @property {string} [id] - Unique identifier.
 * @property {Date|number} [time=new Date()] - Timestamp.
 */

/**
 * OutputMessage – message sent from the system to the UI.
 *
 * Extends {@link Message} with richer metadata, priority handling and error support.
 *
 * @class OutputMessage
 * @extends Message
 */
export default class OutputMessage extends Message {
	static PRIORITY = {
		LOW: 0,
		NORMAL: 1,
		HIGH: 2,
		CRITICAL: 3,
	}

	static TYPES = {
		TEXT: 'text',
		FORM: 'form',
		PROGRESS: 'progress',
		ERROR: 'error',
		INFO: 'info',
		SUCCESS: 'success',
		WARNING: 'warning',
		COMMAND: 'command',
		NAVIGATION: 'navigation',
	}

	/** @type {string[]} */
	body
	/** @type {Object} */
	head = {}
	/** @type {Error|null} */
	error = null
	/** @type {number} */
	priority = OutputMessage.PRIORITY.NORMAL
	/** @type {string} */
	type = OutputMessage.TYPES.INFO
	/** @type {string} */
	id = ''

	/**
	 * Create a new OutputMessage.
	 *
	 * @param {OutputMessageInput|string|string[]|Error} [input={}]
	 */
	constructor(input = {}) {
		if (input instanceof Error) {
			// Shortcut for error messages.
			input = {
				error: input,
				type: OutputMessage.TYPES.ERROR,
				priority: OutputMessage.PRIORITY.CRITICAL,
			}
		} else if (Array.isArray(input)) {
			input = { content: input }
		} else if (typeof input === 'string') {
			input = { content: [input] }
		} else if (typeof input !== 'object' || input === null) {
			input = {}
		}

		const {
			content = [],
			body = undefined,
			head = {},
			error = null,
			priority = OutputMessage.PRIORITY.NORMAL,
			type = OutputMessage.TYPES.INFO,
			id = '',
			time = new Date(),
		} = input

		super({ head, time, body: body ?? content })

		this.id = id || `output-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
		this.body = body ?? content
		this.head = head
		this.error = error instanceof Error ? error : error ? new Error(String(error)) : null
		this.priority = Number(priority)
		this.type = String(type)

		if (!this.type && this.error) this.type = OutputMessage.TYPES.ERROR
		if (!this.type) this.type = OutputMessage.TYPES.INFO
	}

	/** @returns {any[]} */
	get content() {
		const result = (Array.isArray(this.body) ? this.body : [this.body]).slice()
		if (this.error) {
			result.unshift(this.error.stack ?? this.error.message)
		}
		return result
	}

	/** @param {string[]|string} value */
	set content(value) {
		this.body = Array.isArray(value) ? value : [String(value)]
	}

	/** @returns {number} */
	get size() {
		return this.content.length
	}

	/** @returns {boolean} */
	get isError() {
		return this.error !== null || this.type === OutputMessage.TYPES.ERROR
	}

	/** @returns {boolean} */
	get isInfo() {
		return this.type === OutputMessage.TYPES.INFO || this.type === OutputMessage.TYPES.SUCCESS
	}

	/**
	 * Check whether the message type is a known enum value.
	 *
	 * @returns {boolean}
	 */
	isValidType() {
		return Object.values(OutputMessage.TYPES).includes(this.type)
	}

	/**
	 * Determine whether the message contains any body content.
	 *
	 * @returns {boolean}
	 */
	isEmpty() {
		return !this.body || this.body.length === 0
	}

	/**
	 * Combine this message with additional OutputMessages.
	 *
	 * @param {...OutputMessage} messages
	 * @returns {OutputMessage}
	 */
	combine(...messages) {
		const combinedContent = [...this.content]
		let combinedHead = { ...this.head }
		let combinedError = this.error
		let combinedPriority = this.priority
		let combinedType = this.type

		messages.forEach((msg) => {
			if (!(msg instanceof OutputMessage)) return
			combinedContent.push(...msg.content)
			combinedHead = { ...combinedHead, ...msg.head }
			if (msg.error) combinedError = msg.error
			combinedPriority = Math.max(combinedPriority, msg.priority)
			if (msg.type && msg.type !== OutputMessage.TYPES.INFO) combinedType = msg.type
		})

		return new OutputMessage({
			content: combinedContent,
			head: combinedHead,
			error: combinedError,
			priority: combinedPriority,
			type: combinedType,
			id: this.id,
		})
	}

	/**
	 * Serialise the message to a plain JSON object.
	 *
	 * @returns {Object}
	 */
	toJSON() {
		return {
			body: this.body,
			content: this.content,
			head: this.head,
			type: this.type,
			id: this.id,
			time: this.time.toISOString(),
			error: this.error ? { message: this.error.message, stack: this.error.stack } : null,
			priority: this.priority,
		}
	}

	/**
	 * Create an OutputMessage from plain input.
	 *
	 * @param {Object} input
	 * @returns {OutputMessage}
	 */
	static from(input) {
		if (input instanceof OutputMessage) return input
		return new OutputMessage(input)
	}
}
