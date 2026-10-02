import { ModelAsApp, show, progress, result } from '@nan0web/ui'

/**
 * @typedef {import('@nan0web/ui').ModelAsAppOptions & {
 *   payload?: import('payload').BasePayload,
 * }} SeedAppOptions
 */

/**
 * SeedApp - Application controller & subcommand to seed DB data (YAML, NAN0, JSON) into Payload CMS
 */
export class SeedApp extends ModelAsApp {
	static alias = 'seed'

	static UI = {
		title: 'Seed DB-FS Data into Payload CMS',
		start: 'Starting Payload CMS data seeding...',
		scanning: 'Scanning data sources...',
		loading: 'Seeding record [{domain}] ({index}/{total}): {uri}...',
		done: 'Data seeding completed successfully! Seeded {count} records across {collections} collections.',
		errorPayload: 'Payload instance ($payload) is required for {alias}',
		errorPayloadHint: 'No payload.config found. Run with --cwd <path-to-cms-project> pointing to a project with payload.config.ts',
	}

	/** @type {import('@nan0web/ui').FieldSchema} */
	static output = {
		help: 'Output directory or config path',
		default: 'web',
		alias: 'o',
	}

	/**
	 * @param {Partial<SeedApp>} [data = {}]
	 * @param {Partial<SeedAppOptions>} [options = {}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Output directory or config path */ this.output
		if (options.payload && !this._?.payload) {
			this._ = { ...this._, payload: options.payload }
		}
	}

	/**
	 * Guaranteed Payload instance getter.
	 * @throws {Error} If Payload instance is not available.
	 * @returns {import('payload').BasePayload}
	 */
	get $payload() {
		const { t, payload } = this._
		if (!payload) {
			const errorTemplate = this.$UI.errorPayload || SeedApp.UI.errorPayload
			throw new Error(t(errorTemplate, { alias: SeedApp.alias }))
		}
		return payload
	}

	/**
	 * Reads seed files via DB instance using browse from root.
	 * @returns {Promise<string[]>}
	 */
	async readSeedFiles() {
		const db = this.$db
		const items = []
		const seen = new Set()

		for await (const entry of db.browse('.')) {
			const entryPath = entry.path || entry.name
			if (!entryPath) continue
			if (db.Directory?.isConfig?.(entryPath)) continue
			if (db.Directory?.isDirectory?.(entryPath)) continue
			if (db.Directory?.isGlobal?.(entryPath)) continue
			if (db.Directory?.isIndex?.(entryPath)) continue

			const ext = db.extname
				? db.extname(entryPath).toLowerCase().replace(/^\./, '')
				: entryPath.split('.').pop()?.toLowerCase()
			if (['yaml', 'nan0', 'json', 'yml'].includes(ext || '')) {
				if (!seen.has(entryPath)) {
					seen.add(entryPath)
					items.push(entryPath)
				}
			}
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
		if (parts.length > 1) {
			return parts[parts.length - 2]
		}
		const base = parts[0] || 'items'
		const name = base.split('.')[0]
		return name || 'items'
	}

	/**
	 * Base default normalization for DB records.
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
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._

		// Guard: payload must be initialized by withPayload plugin before run()
		if (!this._.payload) {
			const errorMsg = this.$UI.errorPayloadHint || SeedApp.UI.errorPayloadHint
			yield show(t(errorMsg), 'error')
			return result({ status: 'error', reason: 'no-payload' })
		}

		const payload = this.$payload
		const db = this.$db

		const availableCollections = payload.config?.collections
			? new Set(payload.config.collections.map((c) => c.slug))
			: null

		yield progress(t(SeedApp.UI.start))
		yield progress(t(SeedApp.UI.scanning))

		const items = await this.readSeedFiles()

		const touchedCollections = new Set()
		let count = 0
		let i = 0

		for (const uri of items) {
			i++
			const doc = await db.fetch(uri)
			if (doc) {
				const collection = this.resolveCollectionSlug(uri, doc)
				if (availableCollections && !availableCollections.has(collection)) {
					continue
				}

				touchedCollections.add(collection)

				const fileName = db.basename ? db.basename(uri) : uri.split('/').pop()
				yield progress(
					t(SeedApp.UI.loading, {
						uri: fileName,
						domain: collection,
						index: i,
						total: items.length,
					}),
					i,
					items.length
				)

				let rawList = []
				if (Array.isArray(doc)) {
					rawList = doc
				} else if (typeof doc === 'object') {
					rawList = doc.items || doc.records || doc.docs || doc.data || [doc]
				}

				if (!Array.isArray(rawList)) {
					rawList = [rawList]
				}

				if (payload && typeof payload.create === 'function') {
					for (const rawRecord of rawList) {
						if (!rawRecord || typeof rawRecord !== 'object') continue
						try {
							const normalizedRecord = this.normalizeRecord(rawRecord, { domain: collection, uri })

							// Upsert / Create record in payload
							const where = normalizedRecord.cardId
								? { cardId: { equals: normalizedRecord.cardId } }
								: normalizedRecord.slug
									? { slug: { equals: normalizedRecord.slug } }
									: normalizedRecord.title
										? { title: { equals: normalizedRecord.title } }
										: null

							const existing = where
								? await payload.find({ collection, limit: 1, where })
								: { docs: [] }

							if (existing.docs.length > 0) {
								await payload.update({
									collection,
									id: existing.docs[0].id,
									data: normalizedRecord,
								})
							} else {
								await payload.create({ collection, data: normalizedRecord })
							}
							++count
						} catch (e) {
							// continue next record
						}
					}
				} else {
					count += rawList.length
				}
			}
		}

		yield show(
			t(SeedApp.UI.done, {
				count,
				collections: touchedCollections.size,
			}),
			'success'
		)

		return result({
			status: 'ok',
			count,
			collections: Array.from(touchedCollections),
			totalFiles: items.length,
		})
	}
}

/**
 * Backward compatibility export alias.
 */
export { SeedApp as SeedModel }
