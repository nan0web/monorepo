import { Message } from '@nan0web/co'

/**
 * @typedef {Object} MessageBodySchema
 * @property {boolean} [required]
 * @property {string} [help]
 * @property {RegExp} [pattern]
 * @property {string[]} [options]
 * @property {*} [defaultValue]
 * @property {Function} [validate]
 */

/**
 * Base message class for UI communications.
 * A message holds structured data (body) defined by a static Body class.
 * It can represent commands, forms, alerts, or any UI unit.
 *
 * @class UiMessage
 * @extends Message
 *
 * @example
 * class UserLoginMessage extends UiMessage {
 *   static Body = class {
 *     static username = { required: true, help: "Enter username" }
 *     static password = { required: true, type: "password" }
 *     constructor({ username = "", password = "" }) {
 *       this.username = username
 *       this.password = password
 *     }
 *   }
 * }
 */
export default class UiMessage extends Message {
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

	/**
	 * Creates a UiMessage.
	 *
	 * @param {Object} [input={}] - Message properties.
	 */
	constructor(input = {}) {
		super(input)

		const { type, id } = input
		/** @type {string} */
		this.id = id || `ui-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
		/** @type {string} */
		this.type = type ? String(type) : ''

		if (!('body' in input) && 'content' in input) {
			this.body = Array.isArray(input.content) ? input.content : [input.content]
		}
	}

	/**
	 * Checks whether the message contains any body content.
	 *
	 * @returns {boolean}
	 */
	get empty() {
		return !this.body
	}

	/**
	 * Validates the message body against its schema.
	 *
	 * NOTE: The signature must exactly match `Message.validate` – it returns a
	 * `Map<string,string>` regardless of the generic type, otherwise TypeScript
	 * reports incompatibility with the base class.
	 *
	 * @param {any} [body=this.body] - Optional body to validate.
	 * @returns {Map<string,string>} Map of validation errors, empty if valid.
	 */
	validate(body = this.body) {
		/** @type {any} */
		const Class = /** @type {typeof Message} */ (this.constructor).Body
		const result = new Map()
		const entries = /** @type {Array<[string, MessageBodySchema]>} */ (Object.entries(Class))

		for (const [field, schema] of entries) {
			const value = body[field]
			const fn = schema?.validate
			if ('function' === typeof fn) {
				const ok = fn.apply(body, [value])
				if (ok !== true) {
					result.set(field, String(ok))
					continue
				}
			}
			const required = schema?.required ?? false
			if (required && !value) {
				result.set(field, 'Required')
				continue
			}
			if (schema?.pattern && schema.pattern instanceof RegExp) {
				if (!schema.pattern.test(value)) {
					result.set(field, `Does not match pattern: ${schema.pattern}`)
					continue
				}
			}
			if (schema?.options) {
				if (!Array.isArray(schema.options)) {
					throw new Error('Schema options must be an array of possible values')
				}
				if (!schema.options.includes(value)) {
					result.set(field, 'Enumeration must have one value')
					continue
				}
			}
		}
		return result
	}

	/**
	 * Checks if the message type is valid.
	 *
	 * @returns {boolean}
	 */
	isValidType() {
		return Object.values(UiMessage.TYPES).includes(this.type)
	}

	/**
	 * Creates a UiMessage instance from plain data.
	 *
	 * @param {Object} data - Message data.
	 * @returns {UiMessage}
	 */
	static from(data) {
		if (data instanceof UiMessage) return data
		return new this(data)
	}

	/**
	 * Initializes body from input using static Body schema.
	 *
	 * @param {Object} input - Input object.
	 * @param {Function} BodyClass - Static body class with defaults and schema.
	 * @returns {Object} Parsed body.
	 */
	static parseBody(input = {}, BodyClass) {
		const result = {}
		const entries = /** @type {Array<[string, MessageBodySchema]>} */ (Object.entries(BodyClass))

		for (const [field, schema] of entries) {
			const { defaultValue = undefined, ...schemaProps } = schema
			result[field] = input[field] ?? defaultValue
		}
		return result
	}
}
