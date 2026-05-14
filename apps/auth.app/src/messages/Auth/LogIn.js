import Message from '@nan0web/types'

export class LogInBody {
	static ERRORS = {
		identifierMin: 'Identifier must be at least 3 characters',
		identifierOnly: 'Identifier must contain only letters, numbers, underscores, dashes or @',
		passwordMin: 'Password must be at least 6 characters',
		passwordOnly: 'Password cannot have spaces',
	}
	static identifier = {
		minlength: 3,
		label: 'Identifier',
		help: 'Username or email',
		placeholder: 'username or email@example.com',
		type: 'text',
		/** @param {string} identifier @returns {string | true} */
		validation: (identifier) => {
			if (identifier.length < LogInBody.identifier.minlength) {
				return LogInBody.ERRORS.identifierMin
			}
			// extended regex for email support basic
			if (!/^[a-zA-Z0-9_\-@.]+$/.test(identifier)) {
				return LogInBody.ERRORS.identifierOnly
			}
			return true
		},
	}
	/** @type {string} */
	identifier = ''

	static password = {
		label: 'Password',
		help: 'Your password',
		type: 'password',
		/** @param {string} password @returns {string[] | true} */
		validation: (password) => {
			const errors = []
			if (password.length < 6) {
				errors.push(LogInBody.ERRORS.passwordMin)
			}
			if (/\s+/.test(password)) {
				errors.push(LogInBody.ERRORS.passwordOnly)
			}
			return errors.length ? errors : true
		},
	}
	/** @type {string} */
	password = ''

	/** @type {boolean} */
	remember = false

	/**
	 *
	 * @param {Partial<LogInBody>} input
	 */
	constructor(input = {}) {
		const {
			identifier = this.identifier,
			password = this.password,
			remember = this.remember,
		} = input
		this.identifier = String(identifier)
		this.password = String(password)
		this.remember = Boolean(remember)
	}
}

export default class LogIn extends Message {
	static Body = LogInBody
	/** @type {LogInBody} */
	body

	static name = 'login'
	static help = 'Sign in to your account'

	constructor(input = {}) {
		super(input)
		this.body = new LogInBody(input.body)
	}

	get identifierLabel() {
		return LogInBody.identifier.label
	}
	get passwordLabel() {
		return LogInBody.password.label
	}

	get isValid() {
		const i = LogInBody.identifier.validation(this.body.identifier)
		const p = LogInBody.password.validation(this.body.password)
		return i === true && p === true
	}

	static from(input) {
		if (input instanceof LogIn) return input
		return new LogIn(input)
	}

	get errors() {
		const errors = []
		const i = LogInBody.identifier.validation(this.body.identifier)
		if (i !== true) errors.push(i)

		const p = LogInBody.password.validation(this.body.password)
		if (p !== true) {
			if (Array.isArray(p)) errors.push(...p)
			else errors.push(p)
		}
		return errors
	}
}
