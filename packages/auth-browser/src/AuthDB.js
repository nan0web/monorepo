import { User, TokenExpiryService } from '@nan0web/auth-core'
import { HTTPError } from '@nan0web/http'
import { BrowserDB } from '@nan0web/db-browser'

/**
 * @goal
 * # Auth Database
 * Provides authentication-specific functionality on top of DataDB.
 *
 * AuthDB extends DataDB to provide standard authentication functions like
 * registration, sign-in, sign-out, password reset, and third-party auth.
 *
 * ## Requirements
 * - Every function and property must be jsdoc'ed with type (at least);
 * - Every public function must be tested;
 * - Every known vulnerability must be included in test;
 */
class AuthDB extends BrowserDB {
	/** @type {string} */
	token = ''
	/** @type {TokenExpiryService} */
	tokenExpiryService

	static PUBLIC_DIRS = ['auth/', 'public/']
	/**
	 * @param {object} [input]
	 * @param {string} [input.root='/'] - Root path for document operations
	 * @param {string} [input.cwd] - Base URL (host)
	 * @param {string} [input.token=''] - Initial auth token
	 * @param {string} [input.extension='.json']
	 * @param {string} [input.indexFile='index.json']
	 * @param {string} [input.localIndexFile='index.d.json']
	 * @param {number} [input.timeout=6_000] - Request timeout in milliseconds
	 * @param {Function} [input.fetchFn] - Custom fetch function
	 * @param {number} [input.tokenLifetime=3_600_000] - Token lifetime in milliseconds
	 */
	constructor(input = {}) {
		const { root = '/', token = '', tokenLifetime = 3_600_000 } = /** @type {any} */ (input)
		super({ ...input, root })
		this.token = String(token)
		this.tokenExpiryService = new TokenExpiryService(tokenLifetime)
	}

	/**
	 * Fetches a document with authentication headers if available
	 * @param {string} uri - The URI to fetch
	 * @param {object} [requestInit={}] - Fetch request initialization options
	 * @returns {Promise<any>} Fetch response
	 */
	async fetch(uri, requestInit = {}) {
		if (this.token) {
			requestInit.headers ??= {}
			requestInit.headers.Authorization ??= `Bearer ${this.token}`
		}
		return await super.fetch(uri, requestInit)
	}

	/**
	 * @param {string} uri
	 * @param {string} [level='r']
	 * @returns {Promise<void>}
	 */
	async ensureAccess(uri, level = 'r') {
		uri = uri.startsWith('/') ? uri.slice(1) : uri
		await super.ensureAccess(uri, level)

		// Public routes don't require auth
		if (AuthDB.PUBLIC_DIRS.some((d) => uri.startsWith(d))) {
			return
		}

		// Require auth token for other routes
		if (!this.token) {
			throw new HTTPError('Authentication required', 401)
		}

		return
	}

	// Auth API methods
	/**
	 * Register a new user account
	 * @param {object} input - Registration data
	 * @param {string} input.username - Username for new account
	 * @param {string} input.password - Password for new account
	 * @returns {Promise<object>} Registration response
	 */
	async register(input) {
		const result = await this.saveDocument('/auth/signup', input)
		if (result.token) {
			this.token = result.token
		}
		return result
	}

	/**
	 * Confirm user registration with verification code
	 * @param {string} username - Username to confirm
	 * @param {string} code - Verification code
	 * @returns {Promise<object>} Confirmation response with token
	 */
	async confirmRegistration(username, code) {
		const result = await this.writeDocument(`/auth/signup/${username}`, { code })
		this.token = result.token
		return result
	}

	/**
	 * Delete a user account
	 * @param {string} username - Username of account to delete
	 * @returns {Promise<boolean>} Success status
	 */
	async deleteAccount(username) {
		const result = await this.dropDocument(`/auth/signup/${username}`)
		return result
	}

	/**
	 * Sign in a user with username and password
	 * @throws {HTTPError}
	 * @param {string} username - User's username
	 * @param {string} password - User's password
	 * @param {object} [context={}] - Additional context for sign in
	 * @returns {Promise<{token: string} | {error: object}>} Object with token on success and with error on failure.
	 */
	async signIn(username, password, context = {}) {
		const result = await this.saveDocument(`/auth/signin/${username}`, { ...context, password })
		this.me = username
		this.token = result.token
		return result
	}

	/**
	 * Get user data
	 * @throws {HTTPError}
	 * @param {string} username - Username to retrieve
	 * @returns {Promise<User>} User object
	 */
	async getUser(username) {
		const data = await this.loadDocument(`/auth/signin/${username}`)
		return new User(data)
	}

	/**
	 * Get user information
	 * @throws {HTTPError}
	 * @param {string} username - Username to retrieve info for
	 * @returns {Promise<User>} User object with info
	 */
	async getUserInfo(username) {
		const data = await this.loadDocument(`/auth/info/${username}`)
		return new User(data)
	}

	/**
	 * List all users
	 * @throws {HTTPError}
	 * @returns {Promise<string[]>} Array of usernames
	 */
	async listUsers() {
		return await this.loadDocument('/auth/info')
	}

	/**
	 * Refresh authentication token
	 * @param {string} [token] - Token to refresh (defaults to current token)
	 * @param {boolean} [replace=false] - Whether to replace current token
	 * @returns {Promise<object>} Refresh response
	 */
	async refreshToken(token = this.token, replace = false) {
		const result = await this.writeDocument(`/auth/refresh/${token}`, { replace })
		return result
	}

	/**
	 * Initiate password reset process
	 * @param {string} username - Username for password reset
	 * @returns {Promise<object>} Password reset response
	 */
	async forgotPassword(username) {
		const result = await this.saveDocument(`/auth/forgot/${username}`, { target: 'password' })
		if (this.me === username) {
			this.token = ''
		}
		return result
	}

	/**
	 * Reset user password with verification code
	 * @param {string} username - Username
	 * @param {string} code - Verification code
	 * @param {string} password - New password
	 * @returns {Promise<object>} Reset response with new token
	 */
	async resetPassword(username, code, password) {
		const result = await this.writeDocument(`/auth/forgot/${username}`, {
			target: 'password',
			code,
			password,
		})
		if (this.me === username) {
			this.token = result.token
		}
		return result
	}

	/**
	 * Sign out current user
	 * @param {string} username - Username to sign out
	 * @returns {Promise<boolean>} Success status
	 */
	async signOut(username) {
		const result = await this.dropDocument(`/auth/signin/${username}`)
		if (this.me === username) {
			this.token = ''
		}
		return result
	}

	/**
	 * Authenticate with third-party provider
	 * @param {string} provider - Provider name (e.g., 'google', 'github')
	 * @param {string} token - Provider authentication token
	 * @returns {Promise<object>} Authentication response with token
	 */
	async authWithProvider(provider, token) {
		const result = await this.saveDocument(`/auth/${provider}`, { token })
		if (result?.token) this.token = result.token
		return result
	}
}

export default AuthDB
