import { Model } from '@nan0web/types'
import { Content } from './Content.js'
import Navigation from './Navigation.js'
import { Language } from '@nan0web/i18n'

export class Document extends Model {
	static title = { type: 'string', help: 'Title' }
	static content = { type: 'array', model: Content, help: 'Content' }
	static $content = { type: 'array', model: Content, help: 'Layout configuration' }
	static nav = { type: 'any', model: Navigation, help: 'Navigation config or reference' }
	static langs = { type: 'array', model: Language, help: 'Supported languages array' }
	/**
	 * Normalizes a URI for document fetching from DBFS.
	 * @param {string} uri - The URI to normalize.
	 * @param {import('@nan0web/db').DB} [db] - Optional DB instance.
	 * @returns {string} The normalized URL suitable for `db.fetch()`.
	 */
	static normalizeUrl(uri, db) {
		let url = uri || 'index.json'
		if (url === '/') url = 'index.json'

		if (url.endsWith('.html')) {
			url = url.slice(0, -5)
		}

		if (!url.includes('.')) {
			const ext = (db?.Directory?.DATA_EXTNAMES && db.Directory.DATA_EXTNAMES[0]) || '.json'
			url = (url.endsWith('/') ? url + 'index' : url) + ext
		}

		if (url.startsWith('/')) url = url.slice(1)

		return url
	}

	/**
	 * @param {Partial<Document>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Title */ this.title
		/** @type {Array<Content>} Content */ this.content
		/** @type {Array<Content>} Layout configuration */ this.$content
		/** @type {Navigation|string|Array<Navigation>} Navigation config */ this.nav
		/** @type {Array<Language>} Supported languages */ this.langs
	}

	/**
	 * Normalizes a URI using this instance's attached DB (`this._.db`).
	 * @param {string} uri
	 * @param {import('@nan0web/db').DB} [db]
	 * @returns {string}
	 */
	normalizeUrl(uri, db = this._?.db) {
		return Document.normalizeUrl(uri, db)
	}
}
