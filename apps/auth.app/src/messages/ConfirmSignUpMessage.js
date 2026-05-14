import { InputMessage } from '@nan0web/types'

/**
 * @typedef {Object} ConfirmSignUpBody
 * @property {string} contact - Email or phone number
 * @property {string} code - Confirmation code
 */

/**
 * ConfirmSignUpMessage - model for registration confirmation
 *
 * Includes semantics for registration confirmation:
 * - Which fields to use
 * - How to validate data
 * - What helper texts to show
 */
export default class ConfirmSignUpMessage extends InputMessage {
	static name = 'confirm-signup'
	/** @type {ConfirmSignUpBody} */
	body = {
		contact: '',
		code: '',
	}

	constructor(input = {}) {
		super(input)
		const { body = this.body } = input
		const { contact = '', code = '' } = body ?? {}

		this.body = {
			contact: String(contact),
			code: String(code),
		}
	}

	/**
	 * Checks if data is valid
	 * @returns {boolean}
	 */
	get isValid() {
		return !!(this.body.contact && this.body.code && this.body.code.length >= 6)
	}

	/**
	 * Returns errors for each field
	 * @returns {Array<string|Array<string,Object>>}
	 */
	get errors() {
		/** @type {any[]} */
		const errors = []

		if (!this.body.contact) {
			errors.push('Contact is required')
		}

		if (!this.body.code) {
			errors.push('Code is required')
		} else if (this.body.code.length < 6) {
			errors.push(['Code must be at least {{min}} characters', { min: 6 }])
		}

		return errors
	}

	// UI semantics
	get contactLabel() {
		return 'Contact'
	}
	get contactHelp() {
		return 'Email or phone number used during registration'
	}
	get contactPlaceholder() {
		return 'email@example.com or +1234567890'
	}

	get codeLabel() {
		return 'Confirmation code'
	}
	get codeHelp() {
		return 'Code sent to your contact information'
	}
	get codePlaceholder() {
		return '123456'
	}
	get codeMinLength() {
		return 6
	}

	/**
	 * Creates an instance from input
	 * @param {any} input - Input data
	 * @return {ConfirmSignUpMessage}
	 */
	static from(input) {
		if (input instanceof ConfirmSignUpMessage) return input
		return new ConfirmSignUpMessage(input)
	}
}
