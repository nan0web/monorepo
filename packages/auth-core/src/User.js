import Role from './Role.js'
import TokenExpiryService from './TokenExpiryService.js'

/**
 * Interface for user configuration options
 * @typedef {Object} UserInput
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [passwordHash]
 * @property {boolean} [verified]
 * @property {string | null} [verificationCode]
 * @property {string | null} [resetCode]
 * @property {string | null} [resetCodeAt]
 * @property {string | string[]} [roles]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {Map<string, Date>} [tokens]
 * @property {TokenExpiryService} [tokenExpiryService]
 */

/**
 * Represents a user in the authentication system
 */
class User {
	static TOKEN_LIFETIME = 1000 * 60 * 60
	static TokenExpiryService = TokenExpiryService
	static Role = Role
	/** @type {string} */
	name
	/** @type {string} */
	email
	/** @type {string} */
	passwordHash
	/** @type {boolean} */
	verified
	/** @type {string} */
	verificationCode
	/** @type {string} */
	resetCode
	/** @type {Date | null} */
	resetCodeAt
	/** @type {Role[]} */
	roles
	/** @type {Date} */
	createdAt
	/** @type {Date} */
	updatedAt
	/** @type {Map<string, Date>} */
	#tokens
	/** @type {TokenExpiryService} */
	tokenExpiryService = new TokenExpiryService()
	/**
	 * Creates a new User instance
	 * @param {UserInput} input - User configuration options
	 */
	constructor(input = {}) {
		const {
			name = '',
			email = '',
			passwordHash = '',
			verified = false,
			verificationCode = '',
			resetCode = '',
			resetCodeAt = '',
			roles = [],
			createdAt = new Date(),
			updatedAt = new Date(),
			tokens = new Map(),
			tokenExpiryService = this.tokenExpiryService,
		} = input
		this.name = String(name)
		this.email = String(email)
		this.passwordHash = String(passwordHash)
		this.verified = Boolean(verified)
		this.verificationCode = String(verificationCode)
		this.resetCode = String(resetCode)
		this.resetCodeAt = resetCodeAt ? new Date(resetCodeAt) : null
		this.roles = (Array.isArray(roles) ? roles : roles.split(',')).map((r) => this.Role.from(r))
		this.createdAt = new Date(createdAt)
		this.updatedAt = new Date(updatedAt)
		this.#tokens =
			tokens instanceof Map
				? tokens
				: new Map(Array.isArray(tokens) ? tokens : Object.entries(tokens))
		for (const [token, time] of this.#tokens.entries()) {
			this.#tokens.set(token, new Date(time))
		}
		this.tokenExpiryService = this.TokenExpiryService.from(tokenExpiryService)
	}

	/**
	 * @returns {typeof TokenExpiryService}
	 */
	get TokenExpiryService() {
		return /** @type {typeof User} */ (this.constructor).TokenExpiryService
	}

	/**
	 * @returns {typeof Role}
	 */
	get Role() {
		return /** @type {typeof User} */ (this.constructor).Role
	}

	/**
	 * @param {string | Role} role
	 * @returns {boolean} True if roles include the current role, otherwise false.
	 */
	is(role) {
		try {
			const test = this.Role.from(role)
			return this.roles.some((r) => r.value === test.value)
		} catch {
			return false
		}
	}

	/**
	 * Converts user data to a plain object
	 * @returns {object} - User data as a plain object
	 */
	toObject() {
		return {
			...this,
			roles: this.roles.join(','),
			createdAt: this.createdAt.toISOString(),
			updatedAt: this.updatedAt.toISOString(),
		}
	}

	/**
	 * @param {string} token
	 * @returns {Date | undefined}
	 */
	getToken(token) {
		return this.#tokens.get(token)
	}

	/**
	 * @returns {Map<string, Date>}
	 */
	getTokens(validOnly = false) {
		if (validOnly) {
			return new Map(
				Array.from(this.#tokens.entries()).filter(([, time]) =>
					this.tokenExpiryService.isValid(time),
				),
			)
		}
		return this.#tokens
	}

	/**
	 * Represents object as a string (debugger version).
	 * @param {object} [input]
	 * @param {boolean} [input.detailed=false]
	 * @param {boolean} [input.hideDate=false]
	 * @param {boolean} [input.hideRoles=false]
	 * @param {string} [input.eol="\n"]
	 * @returns {string}
	 */
	toString(input = { detailed: false, hideDate: false, hideRoles: false, eol: '\n' }) {
		const { detailed = false, hideDate = false, hideRoles = false, eol = '\n' } = input
		return [
			this.name,
			this.email ? `<${this.email}>` : 0,
			hideDate ? '' : this.createdAt.toISOString().slice(0, 19).replace('T', ' '),
			hideRoles ? '' : this.roles.map((r) => r.toString({ detailed })).join(', '),
		]
			.filter(Boolean)
			.join(eol)
	}

	/**
	 * Creates a new User instance from a raw object
	 * @param {object} input - Raw user data
	 * @returns {User} - User instance
	 */
	static from(input) {
		if (input instanceof User) return input
		return new User(input)
	}
}

export default User
