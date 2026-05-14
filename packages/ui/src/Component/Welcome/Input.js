import { User } from '../../Model/index.js'

/**
 * Represents input data for the Welcome component.
 * Holds user data to display in the welcome message.
 */
class WelcomeInput {
	/** @type {User} User data for welcome message */
	user

	/**
	 * Creates a new WelcomeInput instance.
	 * @param {object} props - Welcome input properties
	 * @param {User|object} [props.user=new User()] - User data
	 */
	constructor(props = {}) {
		const { user = new User() } = props
		this.user = user
	}

	/**
	 * Checks if the input is empty (no user data).
	 * @returns {boolean} True if user data is empty, false otherwise
	 */
	get empty() {
		return this.user.empty
	}

	/**
	 * Converts the input to a string representation.
	 * @returns {string} String representation of the WelcomeInput
	 */
	toString() {
		return `<WelcomeInput user=${this.user}>`
	}

	/**
	 * Creates a WelcomeInput instance from the given props.
	 * @param {WelcomeInput|object} props - The properties to create from
	 * @returns {WelcomeInput} A WelcomeInput instance
	 */
	static from(props = {}) {
		if (props instanceof WelcomeInput) return props
		return new WelcomeInput(props)
	}
}

export default WelcomeInput
