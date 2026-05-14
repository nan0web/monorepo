import Message from './Message.js'
import Contact from './Contact.js'

/**
 * Chat message class.
 *
 * Represents a message in a chat with an author and optional next message,
 * forming a singly linked list of chat entries.
 *
 * @class Chat
 * @extends Message
 */
export default class Chat extends Message {
	/** @type {Contact} */
	author

	/** @type {Chat|null} */
	next

	/**
	 * Create a new Chat instance.
	 *
	 * @param {object} [input={}] - Chat properties or a raw string.
	 * @param {Contact} [input.author] - Message author.
	 * @param {Chat} [input.next] - Next message in chat chain.
	 * @param {any} [input.body] - Message body.
	 * @param {Date|number} [input.time] - Message timestamp.
	 */
	constructor(input = {}) {
		if ('string' === typeof input) {
			// When a raw string is passed, treat it as body content.
			input = { body: Chat.parse(input) }
		}
		const { author = new Contact(), next = null, body = '', time = Date.now() } = input

		super({ body: Chat.escape(body), time: new Date(time) })
		this.author = Contact.from(author)
		this.next = next ? Chat.from(next) : null
	}

	/**
	 * Get the size of the chat chain.
	 *
	 * @returns {number} Number of messages in the chain.
	 */
	get size() {
		let i = 1
		let next = this.next
		while (next) {
			++i
			next = next.next
		}
		return i
	}

	/**
	 * Get the most recent (last) message in the chat chain.
	 *
	 * @returns {Chat} The last chat message.
	 */
	get recent() {
		let current = this
		// @ts-ignore – `next` may be null.
		while (current.next) current = current.next
		return current
	}

	/**
	 * Convert chat to string representation.
	 *
	 * @returns {string} String with timestamp, author and body, separated by "---" for each message.
	 */
	toString() {
		return [
			[this.time.toISOString(), this.author].join(' '),
			this.body,
			this.next ? '---\n' + this.next : '',
		].join('\n')
	}

	/**
	 * Create Chat instance from input.
	 *
	 * @param {any} input - Input to create chat from.
	 * @returns {Chat}
	 */
	static from(input) {
		if (input instanceof Chat) return input
		if (Array.isArray(input)) {
			if (!input.length) return new Chat()
			const arr = input.slice()
			const root = Chat.from(arr.shift())
			let current = root
			for (const entry of arr) {
				current.next = Chat.from(entry)
				current = current.next
			}
			return root
		}
		return new Chat(input)
	}

	/**
	 * Escape chat body to prevent injection of message separators.
	 *
	 * @param {any} body - Body to escape.
	 * @returns {string} Escaped body string.
	 */
	static escape(body) {
		if (typeof body !== 'string') {
			body = String(body)
		}
		// Escape sequences that could be interpreted as message separators.
		return body.replace(/---\n/g, '--- \n')
	}

	/**
	 * Parse a raw chat string into an array of message objects.
	 *
	 * @param {string} chat - String chat to parse.
	 * @returns {Array} Array of parsed message objects.
	 */
	static parse(chat) {
		// Split by message separator and filter out empty parts.
		return chat.split('---\n').filter((part) => part.trim() !== '')
	}
}
