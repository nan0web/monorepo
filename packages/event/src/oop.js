import event from './index.js'

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

	on(event, fn) {
		this.emitter.on(event, fn)
	}

	off(event, fn) {
		this.emitter.off(event, fn)
	}

	async emit(event, data) {
		return await this.emitter.emit(event, data)
	}
}
