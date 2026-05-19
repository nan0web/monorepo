import ModelInputMessage from './ModelInputMessage.js'

export default class SignUpMessage extends ModelInputMessage {
	static alias = 'sign-up'

	static email = {
		help: 'Your email address to authorize',
		type: 'string',
		required: true,
		default: '',
		validate: (v) => {
			if (!v) return 'Email is required'
			return /\S+@\S+\.\S+/.test(v) || 'Email is invalid'
		},
	}

	static password = {
		help: 'Password phrase with no spaces and at least 8 characters',
		type: 'string',
		required: true,
		default: '',
		validate: (v) => {
			if (!v) return 'Password is required'
			return (v && v.length >= 8) || ['Password must be at least {{min}} characters', { min: 8 }]
		},
	}

	static username = {
		help: 'Unique name with no spaces and at least 3 characters',
		type: 'string',
		required: true,
		default: '',
		validate: (v) => {
			if (!v) return 'Username is required'
			return (v && v.length >= 3) || ['Username must be at least {{min}} characters', { min: 3 }]
		},
	}

	static soulId = {
		help: 'Soul identifier',
		type: 'string',
		required: false,
		default: '',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.email
		/** @type {string} */ this.password
		/** @type {string} */ this.username
		/** @type {string} */ this.soulId
	}

	get emailLabel() {
		return 'Email'
	}
	get emailHelp() {
		return this.constructor.email.help
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
		return this.constructor.password.help
	}
	get passwordType() {
		return 'password'
	}

	get usernameLabel() {
		return 'Username'
	}
	get usernameHelp() {
		return this.constructor.username.help
	}
	get usernameMinLength() {
		return 3
	}
}
