import { I18nMessage } from '@nan0web/types'

/**
 * @typedef {Object} RegistrationBody
 * @property {string} username - Username
 * @property {string} password - Password
 */

/**
 * RegistrationMessage - model for user registration requests
 * Validates username and password requirements
 */
export default class RegistrationMessage extends I18nMessage {
	/** @type {RegistrationBody} */
	body = {
		username: '',
		password: '',
	}

	constructor(input = {}) {
		super(input)
		const { body = this.body } = input
		const { username = '', password = '' } = body ?? {}
		this.body = {
			username: String(username),
			password: String(password),
		}
	}

	get usernameHelp() {
		return 'User must have 3 characters minimum and name with only latin characters, numbers, dash -, underscore _, at @, period .'
	}

	get passwordHelp() {
		return 'Password must have 6 characters minimum and must contain any symbols besides spaces'
	}

	/**
	 * Validates username format
	 * @returns {boolean}
	 */
	get isUsernameValid() {
		return !!this.body.username.match(/^[a-z0-9\-_@.]{3,}$/i)
	}

	/**
	 * Validates password format
	 * @returns {boolean}
	 */
	get isPasswordValid() {
		return !!this.body.password.match(/^\S{6,}$/)
	}

	/**
	 * Checks if username is required
	 * @returns {boolean}
	 */
	get isUsernameRequired() {
		return true
	}

	/**
	 * Checks if password is required
	 * @returns {boolean}
	 */
	get isPasswordRequired() {
		return true
	}

	/**
	 * Validates message and returns errors for every field
	 * @returns {Array<string|Array<string,Object>>}
	 */
	get errors() {
		/** @type {Array<string|Array<string,Object>>} */
		const errors = []

		if (!this.body.username) {
			errors.push('Username is required')
		} else if (!this.isUsernameValid) {
			errors.push(this.usernameHelp)
		}

		if (!this.body.password) {
			errors.push('Password is required')
		} else if (!this.isPasswordValid) {
			errors.push(this.passwordHelp)
		}

		return errors
	}

	/**
	 * Creates an instance from input
	 * @param {any} input - Input data
	 * @return {RegistrationMessage}
	 */
	static from(input) {
		if (input instanceof RegistrationMessage) return input
		return new RegistrationMessage(input)
	}
}
