/**
 * TokenExpiryService handles token lifetime validation and management
 * Provides utilities for checking token validity, calculating expiry dates,
 * and managing refresh policies.
 */
class TokenExpiryService {
	/** @type {number} */
	#defaultLifetime

	/**
	 * Create a new TokenExpiryService instance
	 * @param {number} defaultLifetime - Default token lifetime in milliseconds
	 */
	constructor(defaultLifetime = 3_600_000) {
		this.#defaultLifetime = Number(defaultLifetime)
	}

	toString() {
		return (this.#defaultLifetime / 1000).toFixed(3) + 's'
	}

	/**
	 * Check if a token is still valid based on its creation time
	 * @param {Date} tokenCreationTime - When the token was created
	 * @param {number} [lifetime=this.#defaultLifetime] - Token lifetime in milliseconds
	 * @returns {boolean} True if token is still valid, false otherwise
	 */
	isValid(tokenCreationTime, lifetime = this.#defaultLifetime) {
		if (!(tokenCreationTime instanceof Date)) {
			throw new TypeError('tokenCreationTime must be a Date instance')
		}
		return Date.now() - tokenCreationTime.getTime() < Number(lifetime)
	}

	/**
	 * Calculate token expiry date
	 * @param {Date} [issuedAt=new Date()] - Token issue date
	 * @param {number} [lifetime=this.#defaultLifetime] - Token lifetime in milliseconds
	 * @returns {Date} Expiry date
	 */
	getExpiryDate(issuedAt = new Date(), lifetime = this.#defaultLifetime) {
		const expiry = new Date(issuedAt.getTime())
		expiry.setMilliseconds(expiry.getMilliseconds() + Number(lifetime))
		return expiry
	}

	/**
	 * Extend token lifetime by specified milliseconds
	 * @param {Date} tokenCreationTime - When the token was created
	 * @param {number} [extensionMs=0] - Extension in milliseconds
	 * @param {number} [maxLifetime=this.#defaultLifetime] - Maximum lifetime allowed
	 * @returns {number} Extended lifetime in milliseconds
	 */
	extendLifetime(tokenCreationTime, extensionMs = 0, maxLifetime = this.#defaultLifetime) {
		const currentAge = Date.now() - tokenCreationTime.getTime()
		const proposedLifetime = currentAge + Number(extensionMs)
		return Math.min(proposedLifetime, Number(maxLifetime))
	}

	/**
	 * Create a TokenExpiryService instance from input
	 * @param {number|TokenExpiryService} input - Lifetime in ms or existing instance
	 * @returns {TokenExpiryService} TokenExpiryService instance
	 */
	static from(input) {
		if (input instanceof TokenExpiryService) return input
		return new TokenExpiryService(Number(input))
	}
}

export default TokenExpiryService
