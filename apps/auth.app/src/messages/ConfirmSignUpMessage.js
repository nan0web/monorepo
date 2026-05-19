import ModelInputMessage from './ModelInputMessage.js'

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
export default class ConfirmSignUpMessage extends ModelInputMessage {
	static alias = 'confirm-signup'

	static contact = {
		help: 'Email or phone number used during registration',
		type: 'string',
		required: true,
		default: '',
		validate: (v) => !!v || 'Contact is required',
	}

	static code = {
		help: 'Code sent to your contact information',
		type: 'string',
		required: true,
		default: '',
		validate: (v) => {
			if (!v) return 'Code is required'
			return (v && v.length >= 6) || ['Code must be at least {{min}} characters', { min: 6 }]
		},
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.contact
		/** @type {string} */ this.code
	}

	// UI semantics
	get contactLabel() {
		return 'Contact'
	}
	get contactHelp() {
		return this.constructor.contact.help
	}
	get contactPlaceholder() {
		return 'email@example.com or +1234567890'
	}

	get codeLabel() {
		return 'Confirmation code'
	}
	get codeHelp() {
		return this.constructor.code.help
	}
	get codePlaceholder() {
		return '123456'
	}
	get codeMinLength() {
		return 6
	}
}
