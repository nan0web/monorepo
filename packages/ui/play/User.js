/**
 * Simple domain model representing a user with provided meta information for
 * form generation and validation.
 * This model must be used in all interfaces: core, cli, api, react, etc.
 */
export default class User {
	username = ''
	static username = {
		help: 'User name',
		placeholder: 'Enter user name',
		required: true,
		defaultValue: '',
	}

	email = ''
	static email = {
		help: 'E-mail',
		type: 'email',
		placeholder: 'example@domain.com',
		defaultValue: '',
	}

	age = 0
	static age = {
		help: 'Age',
		placeholder: 'Optional',
		defaultValue: 0,
	}
	/**
	 * Constructs a new User instance.
	 *
	 * @param {Partial<User>} [input] Initial data.
	 */
	constructor(input = {}) {
		const {
			username = User.username.defaultValue,
			email = User.email.defaultValue,
			age = User.age.defaultValue,
		} = input
		this.username = String(username)
		this.email = String(email)
		this.age = Number(age)
	}
}
