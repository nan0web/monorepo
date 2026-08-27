// @ts-nocheck
import { Model } from '@nan0web/types'

/**
 * @typedef {'fs'|'redis'|'http'|'memory'} DBProtocolName
 */

/**
 * @typedef {Object} DBConfigType
 * @property {string} url Connection URL or directory path
 * @property {DBProtocolName} protocol Database adapter type
 * @property {string} username Authentication username
 * @property {string} password Authentication password (sensitive)
 * @property {string} database Logical database name or namespace
 * @property {number} maxRetries Maximum reconnection attempts
 * @property {number} timeoutMs Connection timeout in milliseconds
 */

/**
 * DBConfig — Model-as-Schema for database connection configuration.
 *
 * Describes the connection parameters for a database adapter.
 * Embedded within NaN0WebConfig as nested model.
 *
 * Supported protocols (via DBConfig.protocol):
 *   - 'fs'    → @nan0web/db-fs (default, file system)
 *   - 'redis' → @nan0web/db-redis
 *   - 'http'  → @nan0web/db-browser (remote REST)
 *
 * See user-stories.md (lines 18-20)
 *
 * @property {string} url Connection URL or directory path
 * @property {DBProtocolName} protocol Database adapter type
 * @property {string} username Authentication username
 * @property {string} password Authentication password (sensitive)
 * @property {string} database Logical database name or namespace
 * @property {number} maxRetries Maximum reconnection attempts
 * @property {number} timeoutMs Connection timeout in milliseconds
 */
export default class DBConfig extends Model /** @implements {DBConfigType} */ {
	static UI = {
		title: 'Database Configuration',
		description: 'Connection parameters for any DB adapter',
		icon: '🗄️',
	}

	static url = {
		alias: 'dsn',
		help: 'Connection URL or directory path (e.g. data/, redis://localhost:6379)',
		placeholder: 'data/',
		type: 'string',
		default: 'data/',
		required: true,
		validate: (v) =>
			typeof v === 'string' && v.trim().length > 0 ? true : 'error_db_url_required',
	}

	static protocol = {
		help: 'Database adapter type',
		type: 'enum',
		options: ['fs', 'redis', 'http', 'memory'],
		default: 'fs',
	}

	static username = {
		help: 'Authentication username (if required by adapter)',
		type: 'string',
		default: '',
		hidden: true,
	}

	static password = {
		help: 'Authentication password (sensitive — never logged)',
		type: 'string',
		default: '',
		hidden: true,
	}

	static database = {
		help: 'Logical database name or namespace',
		placeholder: 'default',
		type: 'string',
		default: '',
	}

	static maxRetries = {
		help: 'Maximum reconnection attempts before failure',
		type: 'number',
		default: 3,
	}

	static timeoutMs = {
		help: 'Connection timeout in milliseconds',
		type: 'number',
		default: 5000,
	}

	/**
	 * Detect protocol from URL string.
	 * @param {string} url
	 * @returns {'fs'|'redis'|'http'|'memory'}
	 */
	static detectProtocol(url) {
		if (!url || typeof url !== 'string') return 'fs'
		if (url.startsWith('redis://') || url.startsWith('rediss://')) return 'redis'
		if (url.startsWith('http://') || url.startsWith('https://')) return 'http'
		if (url === ':memory:' || url === 'memory://') return 'memory'
		return 'fs'
	}

	/**
	 * Parses DSN string into its components.
	 * @param {string} dsn
	 * @returns {Partial<DBConfigType>}
	 */
	static parseDsn(dsn) {
		if (!dsn || typeof dsn !== 'string') return /** @type {Partial<DBConfigType>} */ ({})
		try {
			if (!dsn.includes('://')) return /** @type {Partial<DBConfigType>} */ ({ url: dsn, protocol: 'fs' })
			const parsed = new URL(dsn)
			return /** @type {Partial<DBConfigType>} */ ({
				url: dsn,
				protocol: /** @type {DBProtocolName} */ (parsed.protocol.replace(':', '')),
				username: decodeURIComponent(parsed.username || ''),
				password: decodeURIComponent(parsed.password || ''),
				database: parsed.pathname.replace(/^\//, ''),
			})
		} catch (e) {
			return /** @type {Partial<DBConfigType>} */ ({ url: dsn })
		}
	}

	/**
	 * @param {Partial<DBConfigType> | string | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		if (typeof data === 'string') data = DBConfig.parseDsn(data)
		else if (data && data.url) data = { ...DBConfig.parseDsn(data.url), ...data }

		super(data, options)

		// Auto-detect protocol from URL if not explicitly set
		if (!/** @type {DBConfigType} */ (this).protocol && /** @type {DBConfigType} */ (this).url) {
			/** @type {DBConfigType} */ (this).protocol = DBConfig.detectProtocol(/** @type {DBConfigType} */ (this).url)
		}
	}

	/**
	 * Build a sanitized DSN string (without credentials).
	 * Safe for logging and diagnostics.
	 * @returns {string}
	 */
	get safeDsn() {
		const _this = /** @type {DBConfigType & import('@nan0web/types').Model} */ (this)
		if (!_this.password || typeof _this.url !== 'string') return _this.url
		return _this.url.replace(`:${_this.password}@`, ':***@')
	}
}
