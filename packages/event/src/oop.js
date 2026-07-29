import event, { EventContext } from './index.js'

/**
 * Base Event class for extension
 */
export default class Event {
	/**
	 * @param {object} input
	 * @param {import("./types/index.js").EventBus} [input.emitter]
	 */
	constructor(input = {}) {
		const { emitter = event() } = input
		this.emitter = emitter
	}

	/**
	 * Listen to an event
	 * @param {string} event
	 * @param {import("./types/index.js").EventListener} fn
	 */
	on(event, fn) {
		this.emitter.on(event, fn)
	}

	/**
	 * Unlisten to an event
	 * @param {string} event
	 * @param {import("./types/index.js").EventListener} fn
	 */
	off(event, fn) {
		this.emitter.off(event, fn)
	}

	/**
	 * Emit an event
	 * @param {string} event
	 * @param {any} data
	 * @returns {Promise<EventContext>}
	 */
	async emit(event, data) {
		return await this.emitter.emit(event, data)
	}
}
