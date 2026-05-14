/**
 * Represents a user with name and email properties.
 */
class User {
	/** @type {string} User name */
	name

	/** @type {string} User email */
	email

	/**
	 * Creates a new User instance.
	 * @param {object} props - User properties or name string
	 * @param {string} [props.name=""] - User name
	 * @param {string} [props.email=""] - User email
	 */
	constructor(props = {}) {
		const { name = '', email = '' } = props
		this.name = String(name)
		this.email = String(email)
	}

	/**
	 * Checks if user data is empty (no name and no email).
	 * @returns {boolean} True if both name and email are empty, false otherwise
	 */
	get empty() {
		return !this.name && !this.email
	}

	/**
	 * Converts user to string representation.
	 * @returns {string} User name and email (if exists)
	 */
	toString() {
		return [this.name, this.email ? `<${this.email}>` : ''].filter(Boolean).join(' ')
	}

	/**
	 * Creates a User instance from the given props.
	 * @param {User|object|string} props - The properties to create from
	 * @returns {User} A User instance
	 */
	static from(props) {
		if (props instanceof User) return props
		if ('string' === typeof props) {
			return new User({ name: props })
		}
		return new User(props)
	}
}

export default User
