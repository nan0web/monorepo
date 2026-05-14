import { InputMessage } from '@nan0web/types'

export default class SignUpMessage extends InputMessage {
	/** @type {Object} */
	static name = 'sign-up'
	body = {
		email: '',
		password: '',
		username: '',
	}

	constructor(input = {}) {
		super(input)
		const { body = {} } = input
		const { email = '', password = '', username = '', soulId } = body

		this.body = {
			email: String(email),
			password: String(password),
			username: String(username),
			soulId,
		}
	}

	get isValid() {
		return !!(
			this.body.email &&
			/\S+@\S+\.\S+/.test(this.body.email) &&
			this.body.password &&
			this.body.password.length >= 8 &&
			this.body.username &&
			this.body.username.length >= 3
		)
	}

	get errors() {
		const errors = []

		if (!this.body.email) {
			errors.push('Email is required')
		} else if (!/\S+@\S+\.\S+/.test(this.body.email)) {
			errors.push('Email is invalid')
		}

		if (!this.body.password) {
			errors.push('Password is required')
		} else if (this.body.password.length < 8) {
			errors.push(['Password must be at least {{min}} characters', { min: 8 }])
		}

		if (!this.body.username) {
			errors.push('Username is required')
		} else if (this.body.username.length < 3) {
			errors.push(['Username must be at least {{min}} characters', { min: 3 }])
		}

		return errors
	}

	get emailLabel() {
		return 'Email'
	}
	get emailHelp() {
		return 'Your email address to authorize'
	}
	get emailPlaceholder() {
		return 'john.doe@example.com'
	}
	get emailType() {
		return 'email'
	}

	get passwordLabel() {
		return 'Password'
	}
	get passwordHelp() {
		return 'Password phrase with no spaces and at least 8 characters'
	}
	get passwordType() {
		return 'password'
	}

	get usernameLabel() {
		return 'Username'
	}
	get usernameHelp() {
		return 'Unique name with no spaces and at least 3 characters'
	}
	get usernameMinLength() {
		return 3
	}

	static from(input) {
		if (input instanceof SignUpMessage) return input
		return new SignUpMessage(input)
	}
}
