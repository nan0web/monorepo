import { Model } from '@nan0web/types'

/**
 * ModelInputMessage - Base class merging @nan0web/types Model (Model-as-Schema)
 * with @nan0web/co InputMessage interface.
 *
 * It maps all schema properties directly to the instance, while providing
 * a `body` getter returning `this` for backward compatibility.
 */
export default class ModelInputMessage extends Model {
	/** @type {string[]} */
	options = []
	/** @type {boolean} */
	waiting = false
	/** @type {Record<string, any>} */
	head = {}
	/** @type {Date} */
	time

	constructor(data = {}, options = {}) {
		// Unwrap 'body' if present to map fields directly onto the instance
		const input = data && data.body ? { ...data.body, ...data } : data
		if (input && 'body' in input) {
			delete input.body
		}
		
		super(input, options)

		if (data && data.options) {
			this.options = Array.isArray(data.options) ? data.options.map(String) : [String(data.options)]
		}
		if (data && data.waiting !== undefined) {
			this.waiting = Boolean(data.waiting)
		}
		this.head = data && data.head ? data.head : {}
		this.time = data && data.time ? new Date(data.time) : new Date()
	}

	/**
	 * Backward compatibility helper for legacy code expecting message.body
	 * @returns {this}
	 */
	get body() {
		return this
	}

	/**
	 * Validation check using resolveValidation
	 * @returns {boolean}
	 */
	get isValid() {
		try {
			this.validate()
			return true
		} catch (e) {
			return false
		}
	}

	/**
	 * Gathers error strings from validation failures
	 * @returns {Array<string|Array<string, any>>}
	 */
	get errors() {
		const errors = []
		try {
			this.validate()
		} catch (err) {
			if (err.fields) {
				errors.push(...Object.values(err.fields))
			} else {
				errors.push(err.message)
			}
		}
		return errors
	}

	/**
	 * Polymorphic static from builder
	 * @param {any} input
	 * @returns {ModelInputMessage}
	 */
	static from(input) {
		if (input instanceof this) return input
		return new this(input)
	}
}
