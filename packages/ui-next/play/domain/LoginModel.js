import { Model } from '@nan0web/types'

export class LoginModel extends Model {
	static username = {
		help: 'Username',
		placeholder: 'user@example.com',
		type: 'string',
		error: 'Must be a valid email',
		required: true,
		validate: (str) =>
			typeof str === 'string' && str.includes('@') ? true : LoginModel.username.error,
	}

	static password = {
		help: 'Password',
		type: 'password',
		error: 'Password must be at least 6 characters',
		required: true,
		validate: (str) =>
			typeof str === 'string' && str.length >= 6 ? true : LoginModel.password.error,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Unique user name or email */ this.username
		/** @type {string} User password */ this.password
	}
}
