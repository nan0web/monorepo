import { empty, notEmpty } from '@nan0web/types'
import Message from './Message.js'

/**
 * @typedef {Partial<Message> | null} InputMessageValue
 *
 * Represents a message input with value, options and metadata.
 *
 * @class InputMessage
 */
export default class InputMessage {
	/** Escape character (ESC) */
	static ESCAPE = String.fromCharCode(27)
	/** @type {typeof Message} */
	static Message = Message

	/** @type {Message} */
	value

	/** @type {string[]} */
	options

	/** @type {boolean} */
	waiting

	/** @type {number} */
	#time

	/**
	 * Create a new InputMessage.
	 *
	 * @param {object} [props={}]
	 * @param {InputMessageValue} [props.value=null] - Input value.
	 * @param {string[]|string} [props.options=[]] - Available options.
	 * @param {boolean} [props.waiting=false] - Waiting flag.
	 * @param {boolean} [props.escaped=false] - Whether to store the ESCAPE character.
	 */
	constructor(props = {}) {
		if (typeof props === 'string') {
			props = { value: { body: props } }
		}
		const { value = new Message(), waiting = false, options = [], escaped = false } = props
		this.#time = Date.now()
		this.waiting = Boolean(waiting)
		this.options = Array.isArray(options) ? options.map(String) : [String(options)]
		this.value = this.Message.from(escaped ? { body: this.ESCAPE } : value)
	}

	/** @returns {string} */
	get ESCAPE() {
		return /** @type {typeof InputMessage} */ (this.constructor).ESCAPE
	}

	/** @returns {typeof Message} */
	get Message() {
		return /** @type {typeof InputMessage} */ (this.constructor).Message
	}

	/** @returns {boolean} */
	get empty() {
		return empty(this.value)
	}

	/** @returns {number} */
	get time() {
		return this.#time
	}

	/** @returns {boolean} */
	get isEscaped() {
		return this.ESCAPE === this.value.body
	}

	/** @returns {boolean} */
	get isValid() {
		return notEmpty(this.value) && this.value.body !== this.ESCAPE
	}

	/**
	 * Convert to plain object, including timestamp.
	 *
	 * @returns {object}
	 */
	toObject() {
		return { ...this, time: this.time }
	}

	/**
	 * Convert to string representation.
	 *
	 * @returns {string}
	 */
	toString() {
		const date = new Date(this.time)
		return `${date.toISOString().split('.')[0]} ${this.value}`
	}

	/**
	 * Create InputMessage from various values.
	 *
	 * @param {InputMessage|object|string} value
	 * @returns {InputMessage}
	 */
	static from(value) {
		if (value instanceof InputMessage) return value
		return new this(value)
	}
}
