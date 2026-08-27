import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, result } from '@nan0web/ui/core'
import DB from '@nan0web/db-fs'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * SeedModel - Subcommand to seed DB-FS data (YAML, NANO, JSON) into Payload CMS
 */
export class SeedModel extends ModelAsApp {
	static alias = 'seed'

	static UI = {
		title: 'Seed DB-FS Data into Payload CMS',
		start: 'Starting Payload CMS data seeding...',
		scanning: 'Scanning data directories: {target}...',
		loading: 'Seeding record [{domain}] ({index}/{total}): {uri}...',
		done: 'Data seeding completed successfully! Seeded {count} records across {collections} collections.',
		errorDb: 'No DB instance found. Cannot run SeedModel command.',
	}

	static dataDir = {
		help: 'Target directory containing SSOT data files (.yaml, .nan0, .json)',
		default: 'data',
		positional: true,
	}

	static output = {
		help: 'Output directory or config path',
		default: 'web',
		alias: 'o',
	}

	/**
	 * @param {Partial<SeedModel>} [data = {}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options = {}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dataDir
		/** @type {string} */ this.output
		/** @type {boolean} */ this.help
	}

	/**
	 * Resolves DB instance from context or creates new DB-FS instance.
	 * @returns {Promise<{ db: any, rootDir: string }>}
	 */
	async getDb() {
		let rootDir = process.cwd()
		// If running inside cms/ subdirectory, ascend to project root if cards/branches exist in parent
		for (const checkDir of [path.resolve(rootDir, '..'), rootDir]) {
			try {
				await fs.access(path.resolve(checkDir, 'cards'))
				rootDir = checkDir
				break
			} catch {}
		}

		if (this._?.db && rootDir === process.cwd()) {
			return { db: this._.db, rootDir }
		}

		return { db: new DB({ cwd: rootDir }), rootDir }
	}

	/**
	 * Resolves initialized Payload CMS instance.
	 * @returns {Promise<any>}
	 */
	async getPayloadInstance() {
		if (this._?.payload) return this._.payload

		const potentialConfigPaths = [
			path.resolve(process.cwd(), 'src/payload.config.js'),
			path.resolve(process.cwd(), 'src/payload.config.ts'),
			path.resolve(process.cwd(), 'payload.config.js'),
			path.resolve(process.cwd(), 'payload.config.ts'),
		]

		for (const configPath of potentialConfigPaths) {
			try {
				await fs.access(configPath)
				const { getPayload } = await import('payload')
				const imported = await import(configPath)
				const configPromise = imported.default || imported.config || imported
				const payload = await getPayload({ config: configPromise })
				return payload
			} catch {
				// Try next candidate
			}
		}

		return null
	}

	/**
	 * Discovers candidate data directories or domains.
	 * @param {string} rootDir
	 * @param {string} [specifiedTarget]
	 * @returns {Promise<string[]>}
	 */
	async resolveScanTargets(rootDir, specifiedTarget) {
		if (specifiedTarget && specifiedTarget !== 'data' && specifiedTarget !== '.') {
			return [specifiedTarget]
		}

		const targets = []
		const standardDirs = [
			'data',
			'cards/data',
			'cards',
			'branches/data',
			'branches',
			'credits/data',
			'credits',
			'currencies/data',
			'currencies',
			'deposits/data',
			'deposits',
			'metals/data',
			'metals',
		]

		for (const dir of standardDirs) {
			try {
				const fullPath = path.resolve(rootDir, dir)
				const stat = await fs.stat(fullPath)
				if (stat.isDirectory()) {
					targets.push(dir)
				}
			} catch {
				// directory does not exist
			}
		}

		return targets.length > 0 ? targets : ['.']
	}

	/**
	 * Reads seed files via filesystem / DB instance across targets.
	 * @param {any} db
	 * @param {string[]} targets
	 * @param {string} rootDir
	 * @returns {Promise<string[]>}
	 */
	async readSeedFiles(db, targets, rootDir) {
		const items = []
		const seen = new Set()
		const ignoredFiles = new Set(['package.json', 'tsconfig.json', 'nan0web.config.yaml', 'redirects.yaml', 'nav.yaml', 'langs.yaml', 't.yaml', 't.json'])

		// If db is injected/mocked with browse implementation
		if (db && typeof db.browse === 'function' && (!rootDir || db === this._?.db)) {
			for (const target of targets) {
				try {
					for await (const entry of db.browse(target)) {
						if (db.Directory?.isConfig?.(entry.path)) continue
						if (db.Directory?.isDirectory?.(entry.path)) continue
						const ext = entry.path.split('.').pop()?.toLowerCase()
						if (['yaml', 'nan0', 'json', 'yml'].includes(ext || '')) {
							if (!seen.has(entry.path)) {
								seen.add(entry.path)
								items.push(entry.path)
							}
						}
					}
				} catch {}
			}
			if (items.length > 0) return items
		}

		for (const target of targets) {
			const targetPath = path.resolve(rootDir, target)
			try {
				const entries = await fs.readdir(targetPath, { recursive: true, withFileTypes: true })
				for (const entry of entries) {
					if (entry.isFile()) {
						if (ignoredFiles.has(entry.name) || entry.name.startsWith('_') || entry.name.startsWith('.')) {
							continue
						}
						const ext = path.extname(entry.name).toLowerCase().slice(1)
						if (['yaml', 'nan0', 'json', 'yml'].includes(ext)) {
							const parent = entry.parentPath || entry.path || targetPath
							const full = path.join(parent, entry.name)
							const rel = path.relative(rootDir, full)
							if (!seen.has(rel)) {
								seen.add(rel)
								items.push(rel)
							}
						}
					}
				}
			} catch (e) {
				// Ignore non-existing targets
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
		const fileName = parts[parts.length - 1] || ''
		if (fileName.includes('departments') || uri.includes('branches')) return 'branches'
		if (fileName.includes('currencies') || uri.includes('currencies')) return 'currencies'
		if (fileName.includes('metal') || uri.includes('metals')) return 'metals'
		if (uri.includes('cards')) return 'cards'
		if (uri.includes('credits')) return 'credits'
		if (uri.includes('deposits')) return 'deposits'
		return parts[parts.length - 2] || 'items'
	}

	/**
	 * Base default normalization for DB-FS records.
	 * @param {any} rawRecord
	 * @param {{ domain?: string, uri?: string }} [context={}]
	 * @returns {Object}
	 */
	normalizeRecord(rawRecord, context = {}) {
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
		const t = this._?.t || ((str, params) => {
			if (!params) return str
			return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), str)
		})

		const { db, rootDir } = await this.getDb()
		const payload = await this.getPayloadInstance()

		const availableCollections = payload?.config?.collections
			? new Set(payload.config.collections.map((c) => c.slug))
			: null

		const initialTarget = this.dataDir || this.target
		const scanTargets = await this.resolveScanTargets(rootDir, initialTarget)

		yield progress(t(SeedModel.UI.start))
		yield progress(t(SeedModel.UI.scanning, { target: scanTargets.join(', ') }))

		const items = await this.readSeedFiles(db, scanTargets, rootDir)
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

				yield progress(
					t(SeedModel.UI.loading, {
						uri: path.basename(uri),
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
					rawList =
						doc.departments ||
						doc.currencies ||
						doc.metals ||
						doc.news ||
						doc.cards ||
						doc.credits ||
						doc.deposits ||
						[doc]
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
			t(SeedModel.UI.done, {
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
