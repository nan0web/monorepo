/**
 * PersistenceManager.js - Orchestrates different data saving strategies.
 * Pure logic, no UI dependencies.
 */
export class PersistenceManager {
	#db
	#strategies = {
		cache: true,
		commit: false,
		git: false,
	}

	/**
	 * @param {object} config
	 * @param {object} config.db - Database instance (@nan0web/db)
	 */
	constructor({ db }) {
		this.#db = db
	}

	/**
	 * Save data using active strategies
	 * @param {string} uri - Document URI
	 * @param {any} data - Content to save
	 * @param {object} [options] - Save options (message, author, etc)
	 */
	async save(uri, data, options = {}) {
		const results = {
			cache: /** @type {any} */ (null),
			commit: /** @type {any} */ (null),
			git: /** @type {any} */ (null),
		}

		// 1. Local Cache (IndexedDB via DBBrowser)
		if (this.#strategies.cache) {
			results.cache = await this.#db.set(uri, data)
		}

		// 2. Commit Strategy (Atomic DB state)
		if (this.#strategies.commit || options.commit) {
			// Logic to mark as committed in DB
			results.commit = await this.#performCommit(uri, data, options)
		}

		// 3. Git Strategy (Remote Versioning)
		if (this.#strategies.git || options.git) {
			results.git = await this.#performGitSync(uri, data, options)
		}

		return results
	}

	async #performCommit(uri, data, options) {
		console.log('PM: Performing Commit...', { uri, message: options.message })
		// TODO: Implement actual commit logic using @nan0web/db standards
		return true
	}

	async #performGitSync(uri, data, options) {
		console.log('PM: Syncing with Git...', { uri })
		// TODO: Implement Git API bridge
		return true
	}

	/**
	 * Configure active strategies
	 * @param {object} settings
	 */
	configure(settings) {
		Object.assign(this.#strategies, settings)
	}
}

export default PersistenceManager
