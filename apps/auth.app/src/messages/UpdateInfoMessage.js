import AuthorizedMessage from './AuthorizedMessage.js'

/**
 * @typedef {Object} UpdateInfoBody
 * @property {string} username - Username
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {number} gender - Gender identifier
 */

/**
 * UpdateInfoMessage - model for updating user information
 * Extends AuthorizedMessage to include authorization requirements
 */
export default class UpdateInfoMessage extends AuthorizedMessage {
	/** @type {UpdateInfoBody} */
	body = {
		username: '',
		firstName: '',
		lastName: '',
		gender: -1,
	}

	constructor(input = {}) {
		super(input)
		const { body = this.body } = input
		const { username = '', firstName = '', lastName = '', gender = -1 } = body ?? {}
		this.body = {
			username: String(username),
			firstName: String(firstName),
			lastName: String(lastName),
			gender: Number(gender),
		}
	}

	/**
	 * Creates an instance from input
	 * @param {any} input - Input data
	 * @return {UpdateInfoMessage}
	 */
	static from(input) {
		if (input instanceof UpdateInfoMessage) return input
		return new UpdateInfoMessage(input)
	}
}
