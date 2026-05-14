import event, { EventContext } from '@nan0web/event'
import DB from '@nan0web/db'
import Logger, { NoLogger } from '@nan0web/log'
import InputMessage from './InputMessage.js'
import OutputMessage from './OutputMessage.js'

/**
 * @typedef {Object} AppConfig
 * @property {DB} db - Database instance.
 * @property {Logger|NoLogger} logger - Logging instance.
 */

/**
 * Core application class.
 *
 * Provides event handling (via {@link event}), a simple in‑memory DB,
 * and a message‑centric `run` method that yields {@link OutputMessage}s.
 *
 * @class App
 */
export default class App {
	static InputMessage = InputMessage
	static OutputMessage = OutputMessage

	/** @type {import("@nan0web/event/types/types").EventBus} */
	#bus
	/** @type {DB} */
	#db
	/** @type {Logger|NoLogger} */
	#logger

	/**
	 * Create a new App instance.
	 *
	 * @param {Partial<AppConfig>} [config={}]
	 */
	constructor(config = {}) {
		this.#bus = event()
		const { db = new DB(), logger = new NoLogger() } = config
		this.#db = db
		this.#logger = logger
	}

	/** @returns {typeof App.InputMessage} */
	get InputMessage() {
		return /** @type {typeof App} */ (this.constructor).InputMessage
	}
	/** @returns {typeof App.OutputMessage} */
	get OutputMessage() {
		return /** @type {typeof App} */ (this.constructor).OutputMessage
	}
	/** @returns {DB} */
	get db() {
		return this.#db
	}
	/** @returns {Logger|NoLogger} */
	get logger() {
		return this.#logger
	}

	/**
	 * Main handler – receives an {@link InputMessage} and yields one or more {@link OutputMessage}s.
	 *
	 * @param {InputMessage} msg
	 * @returns {AsyncGenerator<OutputMessage>}
	 */
	async *run(msg) {
		// Simple echo implementation; real apps would contain business logic.
		yield new this.OutputMessage({ content: ['Run'], type: this.OutputMessage.TYPES.INFO })
	}

	/**
	 * Emit an event on the internal bus.
	 *
	 * @param {string} event
	 * @param {any} data
	 * @returns {Promise<EventContext>}
	 */
	async emit(event, data) {
		return await this.#bus.emit(event, data)
	}

	/**
	 * Subscribe to an event.
	 *
	 * @param {string} event
	 * @param {import("@nan0web/event/types/types").EventListener} fn
	 */
	on(event, fn) {
		this.#bus.on(event, fn)
	}

	/**
	 * Unsubscribe from an event.
	 *
	 * @param {string} event
	 * @param {import("@nan0web/event/types/types").EventListener} fn
	 */
	off(event, fn) {
		this.#bus.off(event, fn)
	}
}
