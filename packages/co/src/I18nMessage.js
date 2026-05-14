import Message from './Message.js'

/**
 * @typedef {(key:string, params?:Record<string,any>)=>string} TranslateFunction
 *
 * Internationalized Message class.
 *
 * Extends {@link Message} with a translation method `t`.
 *
 * @class I18nMessage
 * @extends Message
 */
export default class I18nMessage extends Message {
	/**
	 * Default replacer function for translation parameters.
	 *
	 * Replaces placeholders like `{{name}}` with values from *params*.
	 *
	 * @static
	 * @param {string} key - Translation key containing placeholders.
	 * @param {Record<string, any>} [params={}] - Parameters to replace.
	 * @returns {string} Translated string.
	 */
	static Replacer = (key, params = {}) =>
		Object.entries(params).reduce((str, [k, v]) => str.replaceAll(`{{${k}}}`, v), key)

	/** @type {TranslateFunction} */
	#t

	/**
	 * Create a new I18nMessage instance.
	 *
	 * @param {object} input - Input configuration.
	 * @param {any} [input.body] - Message body.
	 * @param {Date|number} [input.time] - Timestamp.
	 * @param {TranslateFunction} [input.t] - Custom translation function.
	 */
	constructor(input = {}) {
		super(input)

		const {
			t = (key, params) =>
				/** @type {typeof I18nMessage} */ (this.constructor).Replacer(key, params),
		} = input
		this.#t = t
	}

	/**
	 * Translate a key with optional parameters.
	 *
	 * @param {string} key - Translation key.
	 * @param {Record<string, any>} [params] - Parameters for placeholders.
	 * @returns {string} Translated string.
	 */
	t(key, params = {}) {
		return this.#t(key, params)
	}

	/**
	 * Create an I18nMessage from various inputs.
	 *
	 * @param {any} input - Input value.
	 * @returns {I18nMessage}
	 */
	static from(input) {
		if (input instanceof I18nMessage) return input
		if (typeof input !== 'object') {
			return new I18nMessage({ body: input })
		}
		return new I18nMessage(input)
	}
}
