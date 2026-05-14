import AuthDB from './AuthDB.js'

/**
 * Authentication client for browser environments
 * Automatically detects current window location for base URL
 */
class AuthClient extends AuthDB {
	static DEFAULT_HOST = 'http://localhost'
	static DEFAULT_ROOT = '/auth/'
	static DEFAULT_TIMEOUT = 6_000

	/**
	 * Creates a new AuthClient instance
	 * @param {object} options - Client configuration options
	 * @param {string} [options.cwd] - Current working directory/base URL
	 * @param {string} [options.root] - Root path for document operations
	 * @param {number} [options.timeout] - Request timeout in milliseconds
	 * @param {Function} [options.fetchFn] - Custom fetch function
	 */
	constructor(options = {}) {
		let windowCwd
		if ('undefined' !== typeof window) {
			windowCwd = window.location.origin
		}
		const {
			cwd = windowCwd ?? AuthClient.DEFAULT_HOST,
			root = AuthClient.DEFAULT_ROOT,
			timeout = AuthClient.DEFAULT_TIMEOUT,
			fetchFn,
		} = options
		super({
			...options,
			cwd,
			root,
			timeout,
			fetchFn: fetchFn ?? AuthDB.FetchFn,
		})
	}

	/**
	 * Creates and initializes an AuthClient instance
	 * @param {object} options - Client configuration options
	 * @returns {Promise<AuthClient>} Initialized AuthClient instance
	 */
	static async create(options = {}) {
		const client = new AuthClient({ fetchFn: AuthClient.FetchFn, ...options })
		return client
	}
}

export default AuthClient
