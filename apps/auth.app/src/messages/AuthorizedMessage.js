import { I18nMessage } from '@nan0web/types'

/**
 * @typedef {Object} AuthorizedHead
 * @property {string} authorization - Authorization token
 */

/**
 * Message for authorized requests
 * Contains authorization header information
 */
export default class AuthorizedMessage extends I18nMessage {
	/** @type {AuthorizedHead} */
	head = {
		authorization: '',
	}

	constructor(input = {}) {
		super(input)
		const { head = this.head } = input
		const { authorization = '' } = head ?? {}
		this.head = {
			authorization: String(authorization),
		}
	}

	/**
	 * Creates an instance from input
	 * @param {any} input - Input data
	 * @return {AuthorizedMessage}
	 */
	static from(input) {
		if (input instanceof AuthorizedMessage) return input
		return new AuthorizedMessage(input)
	}
}
