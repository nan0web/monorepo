/** @typedef {import('@nan0web/db').default} DB */
import PersistenceManager from './PersistenceManager.js'

/**
 * Universal editor model that works across frameworks.
 * Handles document logic: state, schema validation, and persistence orchestration.
 *
 * @class EditorModel
 * @property {DB} db - Database instance
 * @property {any} content - Current document content
 * @property {string} mode - Current mode ('code' or 'visual')
 */
export default class EditorModel {
	db
	persistence
	content
	mode
	uri
	#listeners = new Set()

	/**
	 * @param {object} input
	 * @param {DB} input.db
	 * @param {string} [input.uri]
	 * @param {any} [input.initialContent=null]
	 * @param {string} [input.mode='code']
	 */
	constructor({ db, uri, initialContent = null, mode = 'preview' }) {
		this.db = db
		this.uri = uri
		this.content = initialContent
		this.mode = mode
		this.persistence = new PersistenceManager({ db })
	}

	/**
	 * Load document from DB
	 * @param {string} [uri] - Optional URI override
	 */
	async loadDocument(uri = this.uri) {
		if (!uri) throw new Error('Cannot load without URI')
		this.uri = uri
		const doc = await this.db.loadDocument(uri)
		this.content = doc
		this.#notify()
		return this.content
	}

	/**
	 * Save document using PersistenceManager
	 * @param {object} [options] - Save options
	 */
	async save(options = {}) {
		if (!this.uri) throw new Error('Cannot save without URI')
		const result = await this.persistence.save(this.uri, this.content, options)
		this.#notify()
		return result
	}

	/**
	 * Update content locally
	 * @param {any} newContent
	 */
	updateContent(newContent) {
		this.content = newContent
		this.#notify()
	}

	/**
	 * Switch between modes
	 * @param {string} mode
	 */
	switchMode(mode) {
		this.mode = mode
		this.#notify()
	}

	/**
	 * Subscribe to changes
	 * @param {Function} fn
	 */
	onChange(fn) {
		this.#listeners.add(fn)
		return () => this.#listeners.delete(fn)
	}

	#notify() {
		this.#listeners.forEach((fn) =>
			fn({
				uri: this.uri,
				content: this.content,
				mode: this.mode,
			}),
		)
	}
}
