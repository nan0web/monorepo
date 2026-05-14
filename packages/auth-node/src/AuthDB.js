import { DB } from '@nan0web/db'
import DBFS from '@nan0web/db-fs'
import { User } from '@nan0web/auth-core'
import { TokenExpiryService } from '@nan0web/auth-core'
import TokenManager from './TokenManager.js'

export class AuthDB {
	static TOKEN_LIFETIME = 3_600_000
	/** @type {Map<string, {time: Date, username: string, isRefresh: boolean}>} */
	tokens = new Map()
	/** @type {Console} */
	logger
	/** @type {TokenExpiryService} */
	tokenExpiryService
	/** @type {TokenManager} */
	tokenManager

	/** @type {DB} */
	db

	get meta() {
		return (this.db && this.db.meta) || { size: 0 }
	}

	get data() {
		return (this.db && this.db.data) || new Map()
	}

	constructor(input = {}) {
		const {
			db,
			logger = console,
			tokenLifetime = AuthDB.TOKEN_LIFETIME,
			tokenManager = new TokenManager(),
		} = input

		this.db = db || new DBFS({ cwd: input.cwd, console: logger })
		this.logger = logger
		this.tokenExpiryService = new TokenExpiryService(tokenLifetime)
		this.tokenManager = TokenManager.from(tokenManager)
	}

	async load() {
		await this.db.connect()
		for await (const entry of this.db.readDir('.', { depth: 10 })) {
			const path = entry.path

			// Skip heavy system directories
			if (path.includes('node_modules') || path.includes('.git')) continue

			if (!path.endsWith('/tokens.json')) continue

			const data = await this.db.loadDocument(path, {})
			const pathParts = path.split('/')
			const username = pathParts[pathParts.length - 2]

			if (!username) continue

			for (const [token, metadata] of Object.entries(data)) {
				this.tokens.set(token, {
					time: new Date(metadata.time),
					username,
					isRefresh: Boolean(metadata.isRefresh),
				})
			}
		}
	}

	getUserPath(username, suffix = '/') {
		const levelA = username.slice(0, 2).toLowerCase()
		const levelB = username.slice(2, 4).toLowerCase()
		return `users/${levelA}/${levelB}/${username}${suffix}`
	}

	async loadDocument(path, defaultValue) {
		return this.db.loadDocument(path, defaultValue)
	}

	async saveDocument(path, data) {
		return this.db.saveDocument(path, data)
	}

	/**
	 * @param {string} token
	 * @returns {Promise<User | null>} The user instance.
	 */
	async auth(token) {
		if (!token) {
			this.logger.debug('No token provided for authentication')
			return null
		}
		this.logger.debug('Authenticating user with token')
		try {
			const data = this.tokens.get(token)
			if (!data) {
				this.logger.debug('Token not found in auth')
				return null
			}

			if (data.isRefresh) {
				if (!this.tokenManager.isRefreshValid(data.time)) {
					await this.deleteToken(token)
					this.logger.debug('Refresh token expired during auth')
					return null
				}
			} else {
				if (!this.tokenManager.isAccessValid(data.time)) {
					await this.deleteToken(token)
					this.logger.debug('Access token expired during auth')
					return null
				}
			}

			const user = await this.getUser(data.username)
			if (!user) {
				this.logger.debug('User not found for token')
				return null
			}

			return user
		} catch (err) {
			this.logger.error('Authentication error:', err)
			return null
		}
	}

	async updateTokens(username, tokenPair) {
		const dir = this.getUserPath(username)
		const tokensPath = `${dir}tokens.json`

		// Store both tokens with their expiry times
		const tokens = await this.db.loadDocument(tokensPath, {})
		tokens[tokenPair.accessToken] = {
			time: tokenPair.accessExpiry.toISOString(),
			isRefresh: false,
		}
		tokens[tokenPair.refreshToken] = {
			time: tokenPair.refreshExpiry.toISOString(),
			isRefresh: true,
		}

		await this.db.saveDocument(tokensPath, tokens)

		// Update in-memory tokens
		this.tokens.set(tokenPair.accessToken, {
			time: tokenPair.accessExpiry,
			username,
			isRefresh: false,
		})
		this.tokens.set(tokenPair.refreshToken, {
			time: tokenPair.refreshExpiry,
			username,
			isRefresh: true,
		})
	}

	async deleteToken(token) {
		const tokenData = this.tokens.get(token)
		if (!tokenData) return false

		const { username } = tokenData
		const tokensPath = this.getUserPath(username) + 'tokens.json'

		this.tokens.delete(token)
		try {
			const tokens = await this.db.loadDocument(tokensPath, {})
			if (tokens[token]) {
				delete tokens[token]
				await this.db.saveDocument(tokensPath, tokens)
			}
			return true
		} catch (err) {
			if (/** @type {any} */ (err).code !== 'ENOENT') {
				this.logger.error('Failed to delete token', err)
			}
			return false
		}
	}

	/**
	 * @param {string} username
	 * @returns {Promise<boolean>} True on success, false on failure.
	 */
	async clearTokens(username) {
		const tokensPath = this.getUserPath(username) + 'tokens.json'
		try {
			await this.db.dropDocument(tokensPath)
			// Invalidate all existing tokens
			for (const [token, data] of this.tokens.entries()) {
				if (data.username === username) {
					this.tokens.delete(token)
				}
			}
			return true
		} catch (err) {
			this.logger.error('Failed to clear tokens', err)
			return false
		}
	}

	/**
	 * @throws
	 * @param {string} username
	 * @returns {Promise<User | null>}
	 */
	async getUser(username) {
		try {
			const data = await this.db.loadDocument(this.getUserPath(username) + 'info.json')
			if (!data) return null
			const tokens = await this.db.loadDocument(this.getUserPath(username) + 'tokens.json', {})
			return new User({ ...data, tokens })
		} catch (err) {
			this.logger.error('Failed to get User', err)
			if (/** @type {any} */ (err).code === 'ENOENT') return null
			throw err
		}
	}

	/**
	 * @param {string} email
	 * @returns {Promise<User | null>}
	 */
	async getUserByEmail(email) {
		try {
			for await (const entry of this.db.readDir('users', { depth: 10 })) {
				const path = entry.path

				// Skip heavy system directories
				if (path.includes('node_modules') || path.includes('.git')) continue

				if (!path.endsWith('info.json')) continue
				const data = await this.db.loadDocument(path)
				const userEmail = data && (data.email || data.contact)
				if (userEmail === email) {
					const tokens = await this.db.loadDocument(path.replace('info.json', 'tokens.json'), {})
					return new User({ ...data, tokens })
				}
			}
		} catch (err) {
			this.logger.error('Failed to find user by email', err)
		}
		return null
	}

	/**
	 * Finds user by username or email
	 * @param {string} identifier - Username or email
	 * @returns {Promise<User | null>}
	 */
	async findUser(identifier) {
		// 1. Try finding by username (fastest)
		try {
			const user = await this.getUser(identifier)
			if (user) return user
		} catch (err) {
			// ignore error if not found
		}

		// 2. Try finding by email (slower)
		return this.getUserByEmail(identifier)
	}

	/**
	 * @param {User} user
	 * @returns {Promise<boolean>}
	 */
	async saveUser(user) {
		if (!/^[a-z0-9_-]{3,32}$/i.test(user.name)) {
			throw new Error('Invalid username format')
		}
		return this.db.saveDocument(`${this.getUserPath(user.name)}info.json`, user.toObject())
	}

	async deleteUser(username) {
		const path = this.getUserPath(username)
		await this.db.dropDocument(`${path}info.json`)
		await this.db.dropDocument(`${path}tokens.json`)
	}

	/**
	 * Lists all users with pagination and optional search
	 * @param {Object} [options]
	 * @param {number} [options.page=1] - Page number (1-based)
	 * @param {string} [options.search=''] - Search filter (name or email)
	 * @param {number} [options.limit=10] - Items per page
	 * @returns {Promise<{ items: Object[], total: number, page: number, pages: number }>}
	 */
	async listUsers({ page = 1, search = '', limit = 10 } = {}) {
		const users = []
		try {
			for await (const entry of this.db.readDir('users', { depth: 10 })) {
				const p = entry.path

				// Skip heavy system directories
				if (p.includes('node_modules') || p.includes('.git')) continue
				if (!p.endsWith('info.json')) continue

				const data = await this.db.loadDocument(p, null)
				if (!data) continue

				if (search) {
					const s = search.toLowerCase()
					const match =
						(data.name && data.name.toLowerCase().includes(s)) ||
						(data.email && data.email.toLowerCase().includes(s))
					if (!match) continue
				}

				users.push({
					name: data.name,
					email: data.email,
					verified: data.verified,
					roles: Array.isArray(data.roles)
						? data.roles
						: typeof data.roles === 'string'
							? data.roles.split(',')
							: [],
					createdAt: data.createdAt,
				})
			}
		} catch (err) {
			this.logger.error('Error listing users', err)
		}

		// Sort by creation date descending
		users.sort((a, b) => {
			const timeB = new Date(b.createdAt || 0).getTime()
			const timeA = new Date(a.createdAt || 0).getTime()
			return timeB - timeA
		})

		const total = users.length
		const skip = (page - 1) * limit
		const items = users.slice(skip, skip + limit)

		return {
			items,
			total,
			page,
			pages: Math.ceil(total / limit) || 1,
		}
	}
}

export default AuthDB
