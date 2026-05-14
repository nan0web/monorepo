import UiMessage from './Message.js'

/**
 * OutputMessage – message sent from the system to the UI.
 *
 * @class OutputMessage
 * @extends UiMessage
 */
export default class OutputMessage extends UiMessage {
	static PRIORITY = {
		LOW: 0,
		NORMAL: 1,
		HIGH: 2,
		CRITICAL: 3,
	}

	/**
	 * Creates an OutputMessage.
	 *
	 * @param {Object} [input={}] - Message properties.
	 */
	constructor(input = {}) {
		super(input)

		const {
			content = [],
			body = [],
			meta = {},
			error = null,
			priority = OutputMessage.PRIORITY.NORMAL,
		} = input

		const contentSource = 'body' in input ? body : 'content' in input ? content : []

		/** @type {string[]} */
		this.body = Array.isArray(contentSource)
			? contentSource
			: contentSource
				? [String(contentSource)]
				: []

		/** @type {Object} */
		this.meta = meta
		/** @type {Error|null} */
		this.error = error instanceof Error ? error : error ? new Error(String(error)) : null
		/** @type {number} */
		this.priority = Number(priority)

		if (!this.type && this.error) {
			this.type = UiMessage.TYPES.ERROR
		} else if (!this.type) {
			this.type = UiMessage.TYPES.INFO
		}
	}

	/** @returns {string[]} */
	get content() {
		return this.body
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
		return this.error !== null || this.type === UiMessage.TYPES.ERROR
	}
	/** @returns {boolean} */
	get isInfo() {
		return this.type === UiMessage.TYPES.INFO || this.type === UiMessage.TYPES.SUCCESS
	}

	/**
	 * Combines multiple messages into a new one.
	 *
	 * @param {...OutputMessage} messages - Messages to combine.
	 * @returns {OutputMessage}
	 */
	combine(...messages) {
		const combinedContent = [...this.content]
		let combinedMeta = { ...this.meta }
		let combinedError = this.error
		let combinedPriority = this.priority

		messages.forEach((msg) => {
			if (msg instanceof OutputMessage) {
				combinedContent.push(...msg.content)
				combinedMeta = { ...combinedMeta, ...msg.meta }
				if (msg.error) combinedError = msg.error
				combinedPriority = Math.max(combinedPriority, msg.priority)
			}
		})

		return new OutputMessage({
			content: combinedContent,
			meta: combinedMeta,
			error: combinedError,
			priority: combinedPriority,
			type: this.type,
		})
	}

	/**
	 * Serialises the message to a plain JSON object.
	 *
	 * @returns {Object}
	 */
	toJSON() {
		return {
			body: this.body,
			content: this.content,
			meta: this.meta,
			type: this.type,
			id: this.id,
			time: this.time.toISOString(),
			error: this.error
				? {
						message: this.error.message,
						stack: this.error.stack,
					}
				: null,
			priority: this.priority,
		}
	}

	/**
	 * Creates an OutputMessage from plain input.
	 *
	 * @param {Object} input - Message data.
	 * @returns {OutputMessage}
	 */
	static from(input) {
		if (input instanceof OutputMessage) return input
		return new OutputMessage(input)
	}
}
