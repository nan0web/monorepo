/**
 * Event context class with preventDefault support
 * @template T = any
 */
class EventContext {
	/** @type {string} */
	type = ''

	/** @type {string} */
	name = ''

	/** @type {Error | null} */
	error = null

	/** @type {T | undefined} */
	data = undefined

	/** @type {object} */
	meta = {}

	/** @type {boolean} */
	defaultPrevented = false

	/**
	 * @param {object} input
	 * @param {string} [input.type]
	 * @param {string} [input.name]
	 * @param {T} [input.data]
	 * @param {object} [input.meta]
	 * @param {Error | null} [input.error]
	 * @param {boolean} [input.defaultPrevented]
	 */
	constructor(input = {}) {
		const {
			type = this.type,
			name = this.name,
			error = this.error,
			data = this.data,
			meta = this.meta,
			defaultPrevented = this.defaultPrevented,
		} = input

		this.type = String(type)
		this.name = String(name)
		this.error = error ? error : null
		this.data = data
		this.meta = { ...meta }
		this.defaultPrevented = Boolean(defaultPrevented)

		// Bind preventDefault to this instance
		this.preventDefault = this.preventDefault.bind(this)
	}

	/**
	 * Clone context
	 * @returns {EventContext}
	 */
	clone() {
		const cloned = new EventContext({
			type: this.type,
			name: this.name,
			data: JSON.parse(JSON.stringify(this.data)),
			meta: { ...this.meta },
			error: this.error,
			defaultPrevented: this.defaultPrevented,
		})
		// Ensure preventDefault is bound to the clone, not referencing parent's method
		cloned.preventDefault = function () {
			this.defaultPrevented = true
		}.bind(cloned)
		return cloned
	}

	/**
	 * Prevents further event propagation
	 */
	preventDefault() {
		this.defaultPrevented = true
	}

	/**
	 * Creates EventContext from input
	 * @param {*} input
	 * @returns {EventContext}
	 */
	static from(input) {
		if (input instanceof EventContext) return input
		return new EventContext(input)
	}
}

export default EventContext
