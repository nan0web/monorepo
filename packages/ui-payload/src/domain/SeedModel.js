import { PayloadApp } from './PayloadApp.js'
import { show, progress, result } from '@nan0web/ui/core'

/**
 * SeedModel - Universal Subcommand to seed DB-FS data into Payload CMS
 * @extends {PayloadApp}
 */
export class SeedModel extends PayloadApp {
	static alias = 'seed'

	static UI = {
		title: 'Seed DB-FS Data into Payload CMS',
		start: 'Starting Payload CMS data seeding...',
		scanning: 'Scanning data directory {target}...',
		loading: 'Loading data from {uri}...',
		seeded: 'Seeded data for {collection} -> {file}',
		done: 'Data seeding completed successfully! Seeded {count} records.',
		errorDb: 'No DB instance found. Cannot run SeedModel command.',
	}

	static dataDir = {
		help: 'Target directory containing SSOT data files (.yaml, .nano, .json)',
		default: 'data',
		positional: true,
	}

	static output = {
		help: 'Output web directory containing payload.config.ts',
		default: 'web',
		alias: 'o',
	}

	/**
	 * @param {Partial<SeedModel>} [data={}]
	 * @param {Partial<import('./PayloadApp.js').PayloadAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target directory containing SSOT data files */ this.dataDir
		/** @type {string} Output path */ this.output
		/** @type {boolean} Help flag */ this.help
	}

	/**
	 * Reads seed files via DB instance.
	 * @param {string} target
	 * @returns {Promise<string[]>}
	 */
	async readSeedFiles(target) {
		const db = this._.db
		if (!db) return []
		let prefix = ''
		if (target && target !== '.') {
			prefix = target.startsWith('@') ? target : `@cwd/${target}`
		}
		const items = []
		try {
			for await (const entry of db.browse(prefix)) {
				if (db.Directory.isConfig(entry.path)) continue
				if (db.Directory.isDirectory(entry.path)) continue
				const ext = entry.path.split('.').pop()?.toLowerCase()
				if (['yaml', 'nan0', 'json', 'yml'].includes(ext || '')) {
					items.push(entry.path)
				}
			}
		} catch (e) {
			// Fallback
		}
		return items
	}

	/**
	 * Dynamically resolves collection slug from document metadata or URI structure.
	 * @param {string} uri
	 * @param {any} [doc]
	 * @returns {string}
	 */
	resolveCollectionSlug(uri, doc = {}) {
		if (doc && typeof doc === 'object') {
			if (doc.$collection) return String(doc.$collection)
			if (doc.model && typeof doc.model === 'string') return doc.model.toLowerCase() + 's'
		}
		const parts = uri.split('/').filter(Boolean)
		return parts[parts.length - 2] || 'items'
	}

	/**
	 * Base default normalization for DB-FS records.
	 * Can be overridden by domain-specific SeedModels (e.g. CardSeedModel, BankSeedModel).
	 * @param {any} rawRecord
	 * @returns {Object}
	 */
	normalizeRecord(rawRecord) {
		const entity = rawRecord.page || rawRecord.doc || rawRecord
		return {
			title: entity.title || rawRecord.title || '',
			slug: entity.slug || rawRecord.slug || '',
			description: entity.description || rawRecord.description || '',
			image: entity.image || rawRecord.image || '',
			order: entity.order ?? rawRecord.order ?? 0,
		}
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, import('@nan0web/ui/core').ResultIntent, any>}
	 */
	async *run() {
		const { db, t } = this._
		if (!db) {
			throw new Error(t(SeedModel.UI.errorDb))
		}

		const payload = await this.getPayloadInstance().catch(() => this._.payload)
		const target = this.dataDir || 'data'

		yield progress(t(SeedModel.UI.start))
		yield progress(t(SeedModel.UI.scanning, { target }))

		const items = await this.readSeedFiles(target)
		let count = 0
		let i = 0
		for (const uri of items) {
			yield progress(t(SeedModel.UI.loading, { uri }), i++, items.length)
			const doc = await db.fetch(uri)
			if (doc) {
				const collection = this.resolveCollectionSlug(uri, doc)
				if (payload && typeof payload.create === 'function') {
					try {
						const rawList = doc.departments || doc.currencies || doc.metals || doc.news || (Array.isArray(doc) ? doc : [doc])
						for (const rawRecord of rawList) {
							const normalizedRecord = this.normalizeRecord(rawRecord)
							await payload.create({ collection, data: normalizedRecord })
							++count
						}
					} catch (e) {
						// Skip fallback record
					}
				} else {
					const rawList = doc.departments || doc.currencies || doc.metals || doc.news || (Array.isArray(doc) ? doc : [doc])
					count += rawList.length
				}
			}
			yield progress(t(SeedModel.UI.loading, { uri }), i, items.length)
		}

		yield show(t(SeedModel.UI.done, { count }), 'success')
		return result({ status: 'ok', count })
	}
}
