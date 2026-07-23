import { flatten } from '../Data.js'
import FetchOptions from '../DB/FetchOptions.js'

/**
 * Validates references ($ref, href, $href) within documents in the database.
 * Supports checking a single document or scanning the entire database.
 * Uses DB.resolveSync to normalize relative paths and DB.statDocument for existence checks.
 *
 * @class
 */
export default class ReferenceValidator {
	/**
	 * @param {import('../DB/DB.js').default} db - Database instance
	 */
	constructor(db) {
		this.db = db
	}

	/**
	 * Extracts all references from a data object by flattening it
	 * and finding keys ending with reference attributes.
	 *
	 * @param {any} data - The data object to parse
	 * @returns {Array<{path: string, ref: string}>} Array of extracted references
	 */
	static extractReferences(data) {
		if (data === null || typeof data !== 'object') return []

		const flat = flatten(data)
		const refs = []
		
		for (const key in flat) {
			if (
				key.endsWith('/$ref') || key === '$ref' ||
				key.endsWith('/href') || key === 'href' ||
				key.endsWith('/$href') || key === '$href'
			) {
				const value = flat[key]
				if (typeof value === 'string' && value.trim() !== '') {
					// Handle cases where reference might contain hash like $ref:file.json#prop
					let refString = value
					if (refString.startsWith('$ref:')) {
						refString = refString.slice(5)
					}
					if (refString.includes('#')) {
						refString = refString.split('#')[0]
					}
					if (refString) {
						refs.push({ path: key, ref: refString })
					}
				}
			}
		}

		return refs.sort((a, b) => a.path.localeCompare(b.path))
	}

	/**
	 * Validates all references within a specific document.
	 * Returns an array of broken references.
	 *
	 * @param {string} uri - The URI of the document to validate
	 * @returns {Promise<Array<{path: string, ref: string, resolvedUri: string}>>} Array of broken references
	 */
	async validateDocument(uri) {
		// Fetch without resolving references so we can inspect them
		const data = await this.db.fetch(uri, new FetchOptions({ refs: false }))
		const extracted = ReferenceValidator.extractReferences(data)
		const broken = []

		const dir = this.db.dirname(uri)

		for (const { path, ref } of extracted) {
			const resolvedUri = this.db.resolveSync(dir, ref)
			const stat = await this.db.statDocument(resolvedUri)
			
			if (!stat.exists) {
				broken.push({ path, ref, resolvedUri })
			}
		}

		return broken
	}

	/**
	 * Scans the database (or a specific directory) for all broken references.
	 * Returns a map of document URIs to their broken references.
	 *
	 * @param {string} [dirPath='.'] - The directory to scan
	 * @returns {Promise<Record<string, Array<{path: string, ref: string, resolvedUri: string}>>>}
	 */
	async validateAll(dirPath = '.') {
		const results = {}

		// Load meta if not loaded to ensure statDocument is fast
		if (!this.db.loaded) {
			await this.db.connect()
		}

		const stream = this.db.readDir(dirPath, { includeDirs: false, depth: 99 })
		for await (const entry of stream) {
			// Skip indexes and non-documents
			if (entry.isFile && !entry.name.startsWith('index.txt')) {
				const broken = await this.validateDocument(entry.path)
				if (broken.length > 0) {
					results[entry.path] = broken
				}
			}
		}

		return results
	}
}
