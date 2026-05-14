import DB from '@nan0web/db'
import { createT } from '@nan0web/i18n'
import { resolveDefaults } from '@nan0web/types'
import AppResult from './AppResult.js'

/** @typedef {{id: string, icon?: string, locale?: string}} Language */

/**
 * Core application class that handles database operations and internationalization.
 *
 * @class
 * @property {DB} db - Database instance for data operations
 * @property {string} locale - Current locale identifier (e.g. 'uk', 'en')
 * @property {object} data - Application data storage
 * @property {Record<string, Function>} actions - Application actions registry
 * @property {object} meta - Application metadata
 * @property {Function} t - Translation function
 */
export default class AppCore {
	static get DB() {
		return DB
	}

	static UI = {
		title: 'Application Core',
		description: 'Base application logic and state container',
		icon: '⚙️',
	}

	static title = { default: '' }
	static uri = { default: '' }
	static locale = { default: 'uk' }
	static data = { default: {} }
	static actions = { default: {} }
	static meta = { default: {} }
	static langs = {
		default: {
			en: {
				id: 'en',
				icon: '🇬🇧',
				locale: 'en-GB',
			},
		},
	}

	#initialized = false
	/** @type {DB} */
	db
	/** @type {string} */
	title
	/** @type {string} */
	uri
	/** @type {string} */
	locale
	/** @type {object} */
	data
	/** @type {Record<string, Function>} */
	actions
	/** @type {object} */
	meta
	/** @type {object} */
	langs
	/** @type {object} */
	element
	/** @type {(key: string, replacements?: Record<string, string>) => string} */
	t = (key, replacements = {}) => key

	/**
	 * Create an AppCore instance
	 * @param {object} input - Application configuration
	 */
	constructor(input = {}) {
		if (input.db && typeof input.db.fetch !== 'function') {
			throw new Error('Database must be an instance of @nan0web/db.DB')
		}
		/** @type {any} */
		const resolved = resolveDefaults(AppCore, { ...input })

		this.db = /** @type {DB} */ (resolved.db)
		this.title = String(resolved.title)
		this.uri = String(resolved.uri)
		this.locale = String(resolved.locale)
		this.data = resolved.data
		this.actions = resolved.actions
		this.meta = resolved.meta
		this.langs = resolved.langs
		this.element = resolved.element || input.element || {}
	}

	/**
	 * Bootstrap internationalization by loading translations from database
	 * @param {string} path - Path to i18n file with locale placeholder
	 * @returns {Promise<void>}
	 */
	async bootstrapI18n(path = `/i18n/{{locale}}.json`) {
		const [code, country] = this.locale.split('-')
		let uri = path.replace('{{locale}}', this.locale)
		let i18n = await this.db.fetch(uri, { defaultValue: null })
		if (null === i18n && country) {
			uri = path.replace('{{locale}}', code)
			i18n = await this.db.fetch(uri, { defaultValue: null })
		}
		this.t = createT(i18n ?? {})
	}

	/**
	 * Initializes the application with async load.
	 * @returns {Promise<boolean>} True if initilized first time, false if already initialized
	 */
	async init() {
		if (this.#initialized) return false
		await this.bootstrapI18n()
		this.#initialized = true
		return true
	}

	/**
	 * Get current application state
	 * @returns {{ data: any, actions: Record<string, Function>, meta: any, t: Function }} Current state object
	 */
	state() {
		return {
			data: this.data,
			actions: this.actions,
			meta: this.meta,
			t: this.t,
		}
	}

	/**
	 * Main application execution method
	 * @abstract Must be implemented in subclass
	 * @returns {Promise<AppResult>}
	 */
	async run() {
		await this.init()
		throw new Error('AppCore: run() must be implemented')
	}

	static from(input) {
		if (input instanceof this) return input
		return new this(input)
	}
}
