import { AccessControl as CoreAccessControl } from '@nan0web/auth-core'

/**
 * Server-side AccessControl with AuthDB I/O.
 * Reads .access, .group, access.txt files from disk via AuthDB.
 * Delegates parsing and matching to @nan0web/auth-core/AccessControl.
 */
export default class AccessControl {
	static ANY = CoreAccessControl.ANY
	static READ = CoreAccessControl.READ
	static WRITE = CoreAccessControl.WRITE
	static DELETE = CoreAccessControl.DELETE
	static USER_ACCESS_FILE = 'access.txt'
	static GROUP_ACCESS_FILE = '.group'
	static GLOBAL_ACCESS_FILE = '.access'

	/**
	 * @param {import('./AuthDB').default} db
	 */
	constructor(db) {
		this.db = db?.db || db
	}

	/**
	 * Checks access permissions for a user on a specific path and access level.
	 * Reads rules from AuthDB on each call (lazy I/O).
	 *
	 * @param {string} username - Username to check access for
	 * @param {string} path - Resource path to check access on
	 * @param {string} [level='r'] - Access level: 'r' (read), 'w' (write), 'd' (delete)
	 * @returns {Promise<boolean>} - True if access is granted, false otherwise
	 */
	async check(username, path, level = 'r') {
		const core = await this._loadCore(username)
		return core.check(username, path, level)
	}

	/**
	 * Ensures access permissions are granted. Throws error if access is denied.
	 *
	 * @param {string} username - Username to check access for
	 * @param {string} path - Resource path to check access on
	 * @param {string} [level='r'] - Access level: 'r' (read), 'w' (write), 'd' (delete)
	 * @returns {Promise<void>}
	 * @throws {Error} - If access is denied
	 */
	async ensureAccess(username, path, level = 'r') {
		const hasAccess = await this.check(username, path, level)
		if (!hasAccess) {
			throw new Error(`Access denied for ${username} to ${path} at level ${level}`)
		}
	}

	/**
	 * Get access summary for a user: their rules and groups.
	 *
	 * @param {string} username - Target username
	 * @returns {Promise<{rules: Array<{subject: string, access: string, target: string}>, groups: Array<string>}>}
	 */
	async info(username) {
		const core = await this._loadCore(username)
		return core.info(username)
	}

	/**
	 * Filter navigation items by user access.
	 *
	 * @param {Array<{path: string, guest?: boolean}>} navItems
	 * @param {string|null} username - null = guest
	 * @returns {Promise<Array<{path: string, guest?: boolean}>>}
	 */
	async filterNav(navItems, username) {
		const core = await this._loadCore(username)
		return core.filterNav(navItems, username)
	}

	// ─── I/O Layer (the ONLY thing this class adds) ───

	/**
	 * Load a CoreAccessControl with rules from AuthDB.
	 * Reads .access, .group, and user-specific access.txt.
	 *
	 * @param {string|null} username
	 * @returns {Promise<CoreAccessControl>}
	 * @private
	 */
	async _loadCore(username) {
		const core = new CoreAccessControl()
		const accessContent = await this._readFile(AccessControl.GLOBAL_ACCESS_FILE)
		const groupContent = await this._readFile(AccessControl.GROUP_ACCESS_FILE)

		// Load user-specific rules and prepend to access content
		let userAccessContent = ''
		if (username) {
			userAccessContent = await this._getUserAccessContent(username)
		}

		const combined = userAccessContent ? userAccessContent + '\n' + accessContent : accessContent

		core.load(combined, groupContent)
		return core
	}

	/**
	 * Read user-specific access.txt from AuthDB user directory.
	 *
	 * @param {string} username
	 * @returns {Promise<string>}
	 * @private
	 */
	async _getUserAccessContent(username) {
		if (!this.db) return ''
		const levelA = username.slice(0, 2).toLowerCase()
		const levelB = username.slice(2, 4).toLowerCase()
		const path = `users/${levelA}/${levelB}/${username}/${AccessControl.USER_ACCESS_FILE}`
		return this._readFile(path)
	}

	/**
	 * Reads a file from AuthDB, returns empty string on error.
	 *
	 * @param {string} path
	 * @returns {Promise<string>}
	 * @private
	 */
	async _readFile(path) {
		if (!this.db) return ''
		try {
			return await this.db.loadDocument(path, '')
		} catch {
			return ''
		}
	}
}
