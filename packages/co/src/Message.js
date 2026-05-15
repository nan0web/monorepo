import { empty, Enum, isConstructible, to as castTo } from '@nan0web/types'

/**
 * @typedef {object} MessageInput
 * @property {Record<string, any>} [input.head] - Message head.
 * @property {any} [input.body] - Message body.
 * @property {Date|number} [input.time] - Creation timestamp.
 */

/**
 * @typedef {(value: any) => true | string | string[]} ValidateFn
 */

/**
 * @typedef {Object} MessageBodySchema
 * @property {string}     [alias]        - Short alias (single‑letter).
 * @property {any}        [defaultValue] - Default value.
 * @property {string}     [help]         - Human readable description.
 * @property {Array}      [options]      - Array of possible options.
 * @property {RegExp}     [pattern]      - Regular expression pattern for validation.
 * @property {string}     [placeholder]  - Placeholder for usage (e.g. "<user>").
 * @property {boolean}    [required]     - Is field required or not.
 * @property {any}        [type]         - Data type.
 * @property {ValidateFn} [validate]     - Validate function.
 */

/**
 * Base Message class.
 *
 * Provides a timestamped container for arbitrary payload data,
 * validation utilities via a static Body schema and
 * a generic {@link parseBody} helper.
 *
 * @class Message
 * @property {Record<string, any>} head - Message head.
 * @property {any} body - Message body.
 * @property {Date} time - Creation timestamp.
 * @property {boolean} isValid - True if message is valid.
 */
export default class Message {
	/**
	 * Body class defines the meta data for the body object.
	 *
	 * Sub‑classes can extend this class to declare fields,
	 * default values, validation functions and attribute metadata.
	 */
	static Body = class {}

	/** @type {Record<string, any>} */
	head = {}
	/** @type {any} */
	body

	/** @type {Date} */
	#time

	/**
	 * Create a new Message instance.
	 *
	 * @param {MessageInput} [input={}]
	 */
	constructor(input = {}) {
		const { head = this.head, body, time = Date.now() } = input
		this.#time = new Date(time)
		this.head = head
		this.body = body
	}

	/**
	 * Check whether the message has no body and no head.
	 *
	 * @returns {boolean}
	 */
	get empty() {
		return empty(this.body) && empty(this.head)
	}

	/**
	 * Returns true if the message passes validation.
	 *
	 * @returns {boolean}
	 */
	get isValid() {
		const errors = this.getErrors()
		return Object.keys(errors).length === 0
	}

	/**
	 * Get message creation time.
	 *
	 * @returns {Date}
	 */
	get time() {
		return this.#time
	}

	/**
	 * Validate body fields according to the static {@link Body} schema.
	 *
	 * @deprecated Moved to validate()
	 * @returns {Record<string, string[]>} Mapping of field names to error messages.
	 */
	getErrors() {
		return Object.fromEntries(Array.from(this.validate()).map(([name, err]) => [name, [err]]))
	}

	/**
	 * Convert message to plain object form.
	 *
	 * @returns {{body:any, time:number}} Object with body and timestamp.
	 */
	toObject() {
		return { body: this.body, time: this.time.getTime() }
	}

	/**
	 * Convert message to a string with ISO timestamp.
	 *
	 * @returns {string}
	 */
	toString() {
		return `${this.time.toISOString()} ${this.body}`
	}

	/**
	 * Validates the message's body.
	 * @returns {Map<string, string>} A map of errors for every incorrect field, empty map if no errors.
	 */
	validate() {
		const Class = /** @type {typeof Message} */ (this.constructor).Body
		const result = new Map()
		/** @type {Array<[string, MessageBodySchema]>} */
		const entries = Object.entries(Class)
		for (const [name, schema] of entries) {
			const value = this.body[name]
			const fn = schema?.validate
			if ('function' === typeof fn) {
				const ok = fn.apply(this.body, [value])
				if (true !== ok) {
					result.set(name, ok)
					continue
				}
			}
			if (schema?.required && !value) {
				result.set(name, 'Required')
				continue
			}
			if (schema?.pattern && schema.pattern instanceof RegExp) {
				if (!schema.pattern.test(value)) {
					result.set(name, 'Does not match pattern' + ` ${schema.pattern}`)
					continue
				}
			}
			if (schema?.options) {
				if (!Array.isArray(schema.options)) {
					throw new Error('Schema options must be an array of possible values')
				}
				if (!schema.options.includes(value)) {
					result.set(name, 'Enumeration must have one value')
					continue
				}
			}
		}
		return result
	}

	/**
	 * Create a Message instance from a simple value.
	 *
	 * @param {any} input - Body string, object or existing Message.
	 * @returns {Message}
	 */
	static from(input) {
		if (input instanceof Message) return input
		if (typeof input === 'string') return new Message({ body: input })
		return new Message(input)
	}

	/**
	 * Parse raw input according to a schema.
	 *
	 * Handles alias mapping, default values and enum validation.
	 *
	 * @param {Record<string, any>} input - Raw input object.
	 * @param {Record<string, any> | Function} Body - Schema definition.
	 * @returns {Record<string, any>} Parsed and validated result.
	 * @throws {Error} When a value fails enum validation.
	 */
	static parseBody(input, Body) {
		const result = {}
		let template = { ...input }
		if (typeof Body === 'function' && isConstructible(Body)) {
			template = Object.create(Body.prototype)
		}
		/** @type {Array<[string, MessageBodySchema]>} */
		const entries = Object.entries(Body)
		for (const [to, config] of entries) {
			// Resolve source key (alias if provided)
			let srcKey = to
			if (config.alias && input[config.alias] !== undefined) {
				srcKey = config.alias
			}
			let value = input[srcKey]

			// Apply default when missing
			if (value === undefined) {
				if ('defaultValue' in config) {
					value = config.defaultValue
				} else if (to in template) {
					value = template[to]
				}
			}

			// Cast to proper type if needed
			let type
			if ('type' in config) {
				type = config.type
			} else if ('defaultValue' in config) {
				type = typeof config.defaultValue
			} else if (to in template) {
				type = typeof template[to]
			} else if ('pattern' in config) {
				type = 'string'
			}
			if (type) {
				value = castTo(type)(value)
			}

			// Enum validation if options provided
			if (Array.isArray(config.options)) {
				value = Enum(...config.options)(value)
			}

			result[to] = value
		}
		return result
	}
}
