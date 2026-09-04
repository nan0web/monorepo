import DBBase from './DBBase.js'
import AuthContext from '../AuthContext.js'
import DocumentStat from '../../DocumentStat.js'

/**
 * Access control layer for the database.
 * Handles connection state, authorization checks, and driver access.
 * Extends DBBase to add authentication and connectivity guarantees.
 *
 * @class
 * @extends {DBBase}
 */
export default class DBAccess extends DBBase {
	/**
	 * Ensures access to document with context.
	 * Delegates to driver for authorization checks.
	 * @param {string} uri - Document URI
	 * @param {'r'|'w'|'d'} [level="r"] - Access level
	 * @param {AuthContext | object} [context=this.context] - Auth context: { username, role, roles, user }
	 * @returns {Promise<void>}
	 * @throws {Error} - Access denied
	 */
	async ensureAccess(uri, level = 'r', context = this.context) {
		this.console.debug('ensureAccess()', uri, { level, context })

		const authContext = AuthContext.from(context)

		if (!['r', 'w', 'd'].includes(level)) {
			this.console.debug('Incorrect level', { uri, level, context })
			throw new TypeError(
				['Access level must be one of [r, w, d]', 'r = read', 'w = write', 'd = delete'].join('\n')
			)
		}

		if (this.driver) {
			const result = await this.driver.access(uri, level, authContext)
			if (false === result) {
				this.console.debug('Access denied', { uri, level, context })
				throw new Error(`Access denied to ${uri} { level: ${level} }`)
			}
		}
	}

	/**
	 * Ensures DB is connected. Throws if connection fails.
	 * @returns {Promise<void>}
	 * @throws {Error} If connection cannot be established
	 */
	async requireConnected() {
		this.console.debug('requireConnected()')
		if (!this.connected) {
			await this.connect()
		}
		if (!this.connected) {
			this.console.error('Database connection failed')
			throw new Error('DB is not connected')
		}
		this.console.info('Database connected successfully')
	}

	/**
	 * Connects to the database. This method should be overridden by subclasses.
	 * Initializes in-memory data from predefined and builds directory metadata.
	 * @abstract
	 * @returns {Promise<void>}
	 */
	async connect() {
		this.console.info('Connecting to database')
		for (const [key, value] of this.predefined.entries()) {
			this.data.set(key, value)
			const isDir = key.endsWith('/')
			this.meta.set(
				key,
				new DocumentStat({
					size: Buffer.byteLength(JSON.stringify(value)),
					mtimeMs: Date.now(),
					isFile: !isDir,
					isDirectory: isDir,
				})
			)
		}
		for (const key of Array.from(this.meta.keys())) {
			const stat = this.meta.get(key)
			if (!stat) continue

			const parts = key.split('/').filter(Boolean)
			if (!key.endsWith('/')) {
				parts.pop()
			}

			let current = ''
			if (parts.length === 0) {
				if (!this.meta.has('.')) {
					this.meta.set(
						'.',
						new DocumentStat({ isDirectory: true, mtimeMs: stat.mtimeMs, size: stat.size })
					)
				} else {
					const dirStat = this.meta.get('.')
					if (dirStat) {
						dirStat.size += stat.size
						if (stat.mtimeMs > dirStat.mtimeMs) dirStat.mtimeMs = stat.mtimeMs
					}
				}
			} else {
				for (const part of parts) {
					current += part + '/'
					if (this.isRoot(current) || current === './') continue
					if (!this.meta.has(current)) {
						this.meta.set(
							current,
							new DocumentStat({ isDirectory: true, mtimeMs: stat.mtimeMs, size: stat.size })
						)
					} else {
						const dirStat = this.meta.get(current)
						if (dirStat) {
							dirStat.size += stat.size
							if (stat.mtimeMs > dirStat.mtimeMs) dirStat.mtimeMs = stat.mtimeMs
						}
					}
				}
			}
		}
		this.connected = true
		this.console.info('Database connected')
	}

	/**
	 * Disconnects from the database.
	 * Clears in-memory data and metadata caches.
	 * @abstract
	 * @returns {Promise<void>}
	 */
	async disconnect() {
		this.console.info('Disconnecting from database')
		this.data.clear()
		this.meta.clear()
		this.connected = false
		this.console.info('Database disconnected')
	}
}
