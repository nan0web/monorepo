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
	 * @param {Partial<Document> & Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Title */ this.title
		/** @type {Array<import('./Content.js').ContentData | any>} Content */ this.content
		/** @type {Array<import('./Content.js').ContentData | any>} Layout configuration */ this.$content
		/** @type {Navigation|string|Array<Navigation|any>|any} Navigation config */ this.nav
		/** @type {Array<Language>} Supported languages */ this.langs
	}

	/**
	 * Resolves the nav field:
	 * - If string "fieldName" → returns this[fieldName]
	 * - If already Navigation / array / object → returns as-is
	 * @returns {Navigation|Navigation[]|object|null}
	 */
	resolveNav() {
		const raw = this.nav
		if (!raw) return null
		if (typeof raw === 'string') {
			return this[raw] ?? null
		}
		return raw
	}

	/**
	 * Recursively expands $content blocks:
	 * - Boolean true → looks up same-named field on this Document instance
	 * - Object → recursively expand its children
	 * - Other values → returned as-is
	 * @param {Array} [blocks=this.$content]
	 * @returns {Array}
	 */
	resolveContent(blocks = this.$content) {
		if (!Array.isArray(blocks)) return []
		const result = []
		for (const block of blocks) {
			if (block == null) { result.push(block); continue }
			if (typeof block !== 'object') { result.push(block); continue }
			if (Array.isArray(block)) {
				for (const b of block) {
					const expanded = this.resolveContentItem(b)
					if (Array.isArray(expanded)) result.push(...expanded)
					else result.push(expanded)
				}
				continue
			}
			const expanded = this.resolveContentItem(block)
			if (Array.isArray(expanded)) result.push(...expanded)
			else result.push(expanded)
		}
		return result
	}

	/**
	 * Resolve a single $content block item.
	 * If the item has multiple boolean-true keys, each resolves to a separate block.
	 * @param {any} item
	 * @returns {any|Array}
	 */
	resolveContentItem(item) {
		if (item == null) return item
		if (typeof item !== 'object') return item
		if (Array.isArray(item)) return item.map((i) => this.resolveContentItem(i))

		const booleans = []
		const nonBooleans = {}

		for (const [key, value] of Object.entries(item)) {
			if (value === true && key !== '$ref' && key !== '_type') {
				booleans.push(key)
			} else if (key === '$ref' || key === '_type') {
				// Skip metadata keys entirely
			} else if (typeof value === 'object' && !Array.isArray(value)) {
				nonBooleans[key] = this.resolveContentItem(value)
			} else {
				nonBooleans[key] = value
			}
		}

		// Multiple boolean-true keys → multiple blocks
		if (booleans.length > 1) {
			return booleans.map((k) => {
				const resolved = this.lookupField(k)
				return resolved != null ? resolved : { [k]: null }
			})
		}

		// Single boolean-true key → resolve it alongside any non-boolean props
		if (booleans.length === 1) {
			const k = booleans[0]
			const resolved = this.lookupField(k)
			if (resolved != null) {
				return typeof resolved === 'object' && resolved !== null
					? { ...resolved, ...nonBooleans }
					: resolved
			}
			return { [k]: null, ...nonBooleans }
		}

		// No booleans — just return the object as-is
		return nonBooleans
	}

	/**
	 * Case-insensitive field lookup on the Document instance.
	 * Tries: exact match → lowercase → title-case.
	 * @param {string} key
	 * @returns {any}
	 */
	lookupField(key) {
		if (this[key] !== undefined) return this[key]
		const lower = key.toLowerCase()
		if (this[lower] !== undefined) return this[lower]
		const title = key.charAt(0).toUpperCase() + key.slice(1)
		if (this[title] !== undefined) return this[title]
		return null
	}

	/**
	 * Normalizes a URI using this instance's attached DB (`this._.db`).
	 * @param {string} uri
	 * @param {import('@nan0web/db').DB | null} [db]
	 * @returns {string}
	 */
	normalizeUrl(uri, db = this._?.db) {
		return Document.normalizeUrl(uri, db)
	}
}
