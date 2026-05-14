import { Model } from '@nan0web/core'
import { progress, log, result } from '@nan0web/ui/core'

/**
 * @file CatalogIndexModel — Server-side catalog index generator.
 *
 * Generates a plain-text `.index.txt` file for a single catalog in a single locale.
 * Format: comment headers (# key: value) + one file path per line.
 *
 * Output path: dist/@catalog/{locale}/{catalog}.index.txt
 */
export class CatalogIndexModel extends Model {
	// ==========================================
	// 1. MODEL AS SCHEMA (Static Definition)
	// ==========================================

	static catalog = {
		help: 'Catalog name',
		default: '',
		type: 'string',
		hint: 'text',
	}

	static locale = {
		help: 'Language code',
		default: 'en',
		type: 'string',
		hint: 'text',
	}

	static version = {
		help: 'Auto-incremented build version',
		default: 0,
		type: 'number',
	}

	static hash = {
		help: 'SHA-256 hash of catalog content',
		default: '',
		type: 'string',
	}

	static itemCount = {
		help: 'Total items in catalog',
		default: 0,
		type: 'number',
	}

	static updatedAt = {
		help: 'ISO 8601 timestamp of last build',
		default: '',
		type: 'string',
	}

	static files = {
		help: 'Index file list',
		default: [],
		hidden: true,
	}

	// ==========================================
	// 2. UI PROJECTION (Zero Hardcode)
	// ==========================================

	static UI = {
		progress_scanning: 'Scanning catalog directory...',
		progress_hashing: 'Hashing content (SHA-256)...',
		progress_writing: 'Writing index file...',
		log_generated: 'Index generated',
		log_empty: 'Catalog is empty, skipping',
		error_no_catalog: 'Catalog name is required',
		error_no_root: 'Root directory is required',
		label_version: 'v{version}',
		label_items: '{count} items',
		label_hash: 'hash: {hash}',
	}

	// ==========================================
	// 4. SERIALIZATION (Plain Text Index)
	// ==========================================

	/**
	 * Serialize index to plain text `.index.txt` format.
	 * Header lines start with `#`, body lines are file paths.
	 *
	 * @returns {string}
	 */
	toString() {
		const header = [
			`# @catalog ${this.catalog} ${this.locale}`,
			`# version: ${this.version}`,
			`# hash: ${this.hash}`,
			`# items: ${this.itemCount}`,
			`# updated: ${this.updatedAt}`,
		]
		return [...header, ...this.files].join('\n') + '\n'
	}

	/**
	 * Parse `.index.txt` content back into CatalogIndexModel.
	 *
	 * @param {string} text - Raw content of .index.txt file
	 * @returns {CatalogIndexModel}
	 */
	static parse(text) {
		const lines = text.split('\n').filter(Boolean)
		const meta = {}
		const files = []

		for (const line of lines) {
			if (line.startsWith('# @catalog ')) {
				const parts = line.slice('# @catalog '.length).trim().split(/\s+/)
				meta.catalog = parts[0] || ''
				meta.locale = parts[1] || 'en'
			} else if (line.startsWith('# version: ')) {
				meta.version = parseInt(line.slice('# version: '.length), 10) || 0
			} else if (line.startsWith('# hash: ')) {
				meta.hash = line.slice('# hash: '.length).trim()
			} else if (line.startsWith('# items: ')) {
				meta.itemCount = parseInt(line.slice('# items: '.length), 10) || 0
			} else if (line.startsWith('# updated: ')) {
				meta.updatedAt = line.slice('# updated: '.length).trim()
			} else if (!line.startsWith('#')) {
				files.push(line.trim())
			}
		}

		return new CatalogIndexModel({ ...meta, files })
	}

	// ==========================================
	// 5. AGNOSTIC LOGIC (Async Generator)
	// ==========================================

	/**
	 * Build catalog index from a directory listing.
	 *
	 * @param {{ listFiles: (path: string) => Promise<string[]>, hash: (files: string[]) => Promise<string>, readVersion?: (catalog: string, locale: string) => Promise<number> }} env
	 * Environment-injected dependencies (no hardcoded fs/crypto imports).
	 */
	async *run(env) {
		if (!this.catalog) {
			yield log('error', CatalogIndexModel.UI.error_no_catalog)
			return result({ success: false })
		}

		// 1. Scan
		yield progress(CatalogIndexModel.UI.progress_scanning)
		const files = await env.listFiles(`${this.locale}/${this.catalog}`)

		if (!files.length) {
			yield log('warn', CatalogIndexModel.UI.log_empty)
			return result({ success: false, reason: 'empty' })
		}

		this.files = files
		this.itemCount = files.length

		// 2. Hash
		yield progress(CatalogIndexModel.UI.progress_hashing)
		this.hash = await env.hash(files)

		// 3. Version
		if (env.readVersion) {
			const prev = await env.readVersion(this.catalog, this.locale)
			this.version = prev + 1
		} else {
			this.version = 1
		}

		// 4. Timestamp
		this.updatedAt = new Date().toISOString()

		// 5. Write
		yield progress(CatalogIndexModel.UI.progress_writing)

		yield log('success', CatalogIndexModel.UI.log_generated)

		return result({
			success: true,
			catalog: this.catalog,
			locale: this.locale,
			version: this.version,
			hash: this.hash,
			itemCount: this.itemCount,
			content: this.toString(),
		})
	}
}
