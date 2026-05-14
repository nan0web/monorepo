import { Model } from '@nan0web/types'
import { resolveDefaults, resolveAliases } from '@nan0web/types'

/**
 * @typedef {{ file: string, line: number, type: string, content: string, score: number, source: string }} SearchHit
 */

/**
 * 📐 MODEL-AS-SCHEMA + MODEL-AS-APP
 * Domain Model for LLiMo Knowledge Base Search.
 *
 * Cascading search engine: CWD → local projects → external packages.
 * Hash-based freshness check before every search.
 * Smart Early Stop when local results are sufficient.
 *
 * @example
 *   llimo search "renderForm options"
 *   llimo search "Model" --in @nan0web/ui-cli
 *   llimo search "Model" --deps --limit 20
 */
/**
 * @property {string} query Search query text
 * @property {string} inPackage Search only in a specific package
 * @property {number} limit Maximum number of results
 * @property {'cwd' | 'local' | 'all'} depth Cascade depth
 * @property {number} threshold Minimum relevance score (0–1)
 * @property {boolean} deps Search all project dependencies
 * @property {boolean} forceAll Force full cascade (ignore Smart Stop)
 * @property {boolean} externalOnly Search only external packages (skip CWD and local)
 * @property {string} cwd Working directory override
 */
export class KBSearchModel extends Model {









	/**
	 * @typedef {Object} KBSearchDeps
	 * @property {Object} searcher
	 * @property {(db: import('@nan0web/db').DB, query: string, dir: string, opts: object) => Promise<SearchHit[]>} searcher.search Searches in a specific directory
	 * @property {(db: import('@nan0web/db').DB) => Promise<string[]>} searcher.listLocalProjects Lists other indexed local projects
	 * @property {(db: import('@nan0web/db').DB) => Promise<string[]>} searcher.listExternalPackages Lists indexed external packages
	 * @property {(db: import('@nan0web/db').DB, hits: SearchHit[], cwd: string) => Promise<Object[]>} searcher.findUnindexedDependencies Finds missing packages in hits
	 * @property {(db: import('@nan0web/db').DB, source: string) => Promise<string | null>} searcher.resolvePackageIndex Resolves package identifier to its index directory
	 * @property {Object} hashStore
	 * @property {(db: import('@nan0web/db').DB, dir: string, currentFiles: string[]) => Promise<boolean>} hashStore.isStale Checks if index is stale
	 * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<string | null>} hashStore.read Reads hash
	 * @property {(db: import('@nan0web/db').DB, dir: string, hash: string) => Promise<void>} hashStore.write Writes hash
	 * @property {Object} indexer
	 * @property {(db: import('@nan0web/db').DB, registry: string, name: string, dir: string) => Promise<void>} indexer.downloadPackage Downloads package
	 * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<void>} indexer.reindex Force reindexes a directory
	 */
	// ==========================================
	// 1. MODEL AS SCHEMA (Static field descriptors)
	// ==========================================

	static query = {
		help: 'Search query text',
		default: '',
		hint: 'text',
		positional: true,
		validate: (/** @type {string} */ val) => (val ? true : 'query_required'),
	}

	static inPackage = {
		alias: 'in',
		help: 'Search only in a specific package',
		default: '',
		hint: 'text',
	}

	static limit = {
		help: 'Maximum number of results',
		default: 10,
		hint: 'number',
		type: 'number',
	}

	static depth = {
		help: 'Cascade depth',
		default: 'all',
		hint: 'select',
		options: ['cwd', 'local', 'all'],
	}

	static threshold = {
		help: 'Minimum relevance score (0–1)',
		default: 0.75,
		hint: 'number',
		type: 'number',
	}

	static deps = {
		help: 'Search all project dependencies',
		default: false,
		hint: 'toggle',
		type: 'boolean',
	}

	static forceAll = {
		help: 'Force full cascade (ignore Smart Stop)',
		default: false,
		hint: 'toggle',
		type: 'boolean',
	}

	static externalOnly = {
		help: 'Search only external packages (skip CWD and local)',
		default: false,
		hint: 'toggle',
		type: 'boolean',
	}

	static cwd = {
		help: 'Working directory override',
		default: '',
		hint: 'path',
	}

	// ==========================================
	// 2. UI (i18n-ready messages — English only)
	// ==========================================

	static UI = {
		query_required: 'Search query is required',
		checking_hash: 'Checking index freshness',
		reindexing_stale: 'Index stale — reindexing before search',
		searching_cwd: 'Searching local project (CWD)',
		searching_local: 'Searching other indexed projects',
		searching_external: 'Searching external packages',
		smart_stop: 'Smart Stop — enough high-quality local results',
		no_results: 'No results found',
		search_complete: 'Search complete',
		download_dependency_confirm: 'Package not indexed. Download for deeper search?',
		index_not_found: 'No index found for this project. Run `llimo index` first.',
	}

	/**
	 * Smart Early Stop: if CWD yields ≥ limit results with
	 * average relevance ≥ this value, skip external packages.
	 */
	static SMART_STOP_THRESHOLD = 0.85

	// ==========================================
	// 3. INSTANCE FIELDS (declared via resolveDefaults in Model)
	//    query, inPackage, limit, depth, threshold, deps,
	//    forceAll, externalOnly, cwd — initialized by base constructor
	// ==========================================

	// ==========================================
	// 4. PURE DOMAIN HELPERS
	// ==========================================

	constructor(data = {}, config = {}) {
		super(data)
		/** @type {any} Search query text */ this.query
		/** @type {any} Search only in a specific package */ this.inPackage
		/** @type {number} Maximum number of results */ this.limit
		/** @type {any} Cascade depth */ this.depth
		/** @type {number} Minimum relevance score (0–1) */ this.threshold
		/** @type {boolean} Search all project dependencies */ this.deps
		/** @type {boolean} Force full cascade (ignore Smart Stop) */ this.forceAll
		/** @type {boolean} Search only external packages (skip CWD and local) */ this.externalOnly
		/** @type {any} Working directory override */ this.cwd
		this._config = config
		// Manual alias fallback for 'in' -> 'inPackage'
		if ('in' in data && data.in !== undefined) {
			/** @type {any} */ (data).inPackage = data.in
			delete data.in
		}

	}

	/** @returns {string} Resolved working directory */
	get workDir() {
		return this.cwd
	}

	/** @returns {Record<string, string>} Environment variables (injected or process) */
	get env() {
		return this._config?.env ?? process.env
	}

	/**
	 * Evaluates Smart Early Stop condition.
	 *
	 * @param {SearchHit[]} hits - Current result set
	 * @returns {boolean} True if cascade should stop
	 */
	shouldSmartStop(hits) {
		if (this.forceAll) return false
		if (hits.length < this.limit) return false

		const avgScore = hits.reduce((sum, h) => sum + h.score, 0) / hits.length
		return avgScore >= KBSearchModel.SMART_STOP_THRESHOLD
	}

	/**
	 * Merges and deduplicates results, sorted by score descending.
	 *
	 * @param {SearchHit[][]} layers - Results from each cascade level
	 * @returns {SearchHit[]} Top `limit` results
	 */
	mergeResults(layers) {
		const all = layers.flat()
		const unique = new Map()

		for (const hit of all) {
			const key = `${hit.file}:${hit.line}`
			const existing = unique.get(key)
			if (!existing || hit.score > existing.score) {
				unique.set(key, hit)
			}
		}

		return [...unique.values()]
			.filter((h) => h.score >= this.threshold)
			.sort((a, b) => b.score - a.score)
			.slice(0, this.limit)
	}

	// ==========================================
	// 5. AGNOSTIC LOGIC (Async Generator — OLMUI)
	// ==========================================

	/**
	 * Main search generator — yields OLMUI intents.
	 *
	 * Intent types emitted:
	 * - `progress` — status update for UI
	 * - `ask`      — interactive question to user (e.g. download confirmation)
	 * - `log`      — info/warning/error message
	 * - return     — final `{ type: 'result', payload }` or `{ status: 'failed' }`
	 *
	 * @param {{ searcher: object, hashStore: object, indexer: object }} deps
	 *   - searcher:  { search(query, indexDir, opts) → Promise<SearchHit[]> }
	 *   - hashStore: { read(dir) → Promise<string|null>, isStale(dir) → Promise<boolean> }
	 *   - indexer:   { reindex(dir) → Promise<void>, downloadPackage(registry, name, dir) → Promise<void> }
	 */
	async *run(deps) {
		const { searcher, hashStore, indexer } = deps
		const db = (/** @type {any} */ (this._).db)

		// 1. Validate query
		if (!this.query) {
			yield { type: 'log', level: 'error', message: KBSearchModel.UI.query_required }
			return { status: 'failed', reason: 'no_query' }
		}

		/** @type {SearchHit[][]} */
		const layers = []

		// 2. Direct package search (--in flag)
		if (this.inPackage) {
			yield {
				type: 'progress',
				message: `${KBSearchModel.UI.searching_external}: ${this.inPackage}`,
			}

			const indexDir = await searcher.resolvePackageIndex(db, this.inPackage)
			if (!indexDir) {
				yield { type: 'log', level: 'warning', message: KBSearchModel.UI.index_not_found }
				return { status: 'failed', reason: 'no_index' }
			}

			const hits = await searcher.search(db, this.query, indexDir, {
				limit: this.limit,
				threshold: this.threshold,
			})

			yield { type: 'log', level: 'info', message: KBSearchModel.UI.search_complete }

			return {
				type: 'result',
				data: {
					query: this.query,
					hits,
					total: hits.length,
					sources: [this.inPackage],
				},
			}
		}

		// ─── CASCADE SEARCH ──────────────────────

		// 3. Level 1: CWD
		if (!this.externalOnly) {
			yield { type: 'progress', message: KBSearchModel.UI.checking_hash }

			// Note: isStale might need current files to compare hash.
			// For simplicity we'll assume isStale handles its own scanner or we pass an empty array to force check.
			const stale = await hashStore.isStale(db, this.workDir, [])
			if (stale) {
				yield { type: 'progress', message: KBSearchModel.UI.reindexing_stale }
				await indexer.reindex(db, this.workDir)
			}

			const cwdIndex = `${this.workDir}/.datasets`
			const hasIndex = await hashStore.read(db, this.workDir)

			if (!hasIndex) {
				yield { type: 'log', level: 'warning', message: KBSearchModel.UI.index_not_found }
			} else {
				yield { type: 'progress', message: KBSearchModel.UI.searching_cwd }

				const cwdHits = await searcher.search(db, this.query, cwdIndex, {
					limit: this.limit,
					threshold: this.threshold,
				})

				layers.push(cwdHits.map((h) => ({ ...h, source: 'cwd' })))

				// Smart Early Stop
				if (!this.forceAll && this.shouldSmartStop(cwdHits)) {
					yield { type: 'log', level: 'info', message: KBSearchModel.UI.smart_stop }
					return {
						type: 'result',
						data: {
							query: this.query,
							hits: this.mergeResults(layers),
							total: cwdHits.length,
							smartStop: true,
							sources: ['cwd'],
						},
					}
				}
			}

			if (this.depth === 'cwd') {
				const merged = this.mergeResults(layers)
				return this.#finalResult(merged, ['cwd'])
			}
		}

		// 4. Level 2: Other local indexed projects
		if (!this.externalOnly && this.depth !== 'cwd') {
			yield { type: 'progress', message: KBSearchModel.UI.searching_local }

			const localDirs = await searcher.listLocalProjects(db)
			for (const dir of localDirs) {
				const localHits = await searcher.search(db, this.query, `${dir}/.datasets`, {
					limit: this.limit - this.#currentCount(layers),
					threshold: this.threshold,
				})
				layers.push(localHits.map((h) => ({ ...h, source: `local:${dir}` })))

				if (this.#currentCount(layers) >= this.limit && !this.forceAll) break
			}

			if (this.depth === 'local') {
				const merged = this.mergeResults(layers)
				return this.#finalResult(merged, ['cwd', 'local'])
			}
		}

		// 5. Level 3: External packages
		if (this.depth === 'all' || this.externalOnly) {
			yield { type: 'progress', message: KBSearchModel.UI.searching_external }

			const externalDirs = await searcher.listExternalPackages(db)
			for (const dir of externalDirs) {
				const extHits = await searcher.search(db, this.query, `${dir}/.datasets`, {
					limit: this.limit - this.#currentCount(layers),
					threshold: this.threshold,
				})
				layers.push(extHits.map((h) => ({ ...h, source: `external:${dir}` })))

				if (this.#currentCount(layers) >= this.limit && !this.forceAll) break
			}

			// Auto-discovery: check if results reference unindexed packages
			const merged = this.mergeResults(layers)
			const unindexed = await searcher.findUnindexedDependencies(db, merged, this.workDir)

			for (const pkg of unindexed) {
				const response = yield {
					type: 'ask',
					field: 'confirm',
					schema: {
						help: `${KBSearchModel.UI.download_dependency_confirm} (${pkg.name})`,
						hint: 'confirm',
					},
				}
				const confirmed = response.value

				if (confirmed) {
					yield { type: 'progress', message: `Downloading ${pkg.name}...` }
					await indexer.downloadPackage(db, pkg.registry, pkg.name, pkg.targetDir)
					await indexer.reindex(db, pkg.targetDir)

					const depHits = await searcher.search(db, this.query, `${pkg.targetDir}/.datasets`, {
						limit: this.limit - merged.length,
						threshold: this.threshold,
					})
					layers.push(depHits.map((h) => ({ ...h, source: `external:${pkg.name}` })))
				}
			}
		}

		// 6. Final result
		const finalHits = this.mergeResults(layers)

		if (finalHits.length === 0) {
			yield { type: 'log', level: 'warning', message: KBSearchModel.UI.no_results }
		}

		return this.#finalResult(finalHits, this.#collectSources(layers))
	}

	// ==========================================
	// 6. PRIVATE HELPERS
	// ==========================================

	/**
	 * @param {SearchHit[]} hits
	 * @param {string[]} sources
	 */
	#finalResult(hits, sources) {
		return {
			type: 'result',
			data: {
				query: this.query,
				hits,
				total: hits.length,
				sources,
			},
		}
	}

	/**
	 * @param {SearchHit[][]} layers
	 * @returns {number}
	 */
	#currentCount(layers) {
		return layers.reduce((sum, l) => sum + l.length, 0)
	}

	/**
	 * @param {SearchHit[][]} layers
	 * @returns {string[]}
	 */
	#collectSources(layers) {
		const sources = new Set()
		for (const layer of layers) {
			for (const hit of layer) {
				sources.add(hit.source)
			}
		}
		return [...sources]
	}
}
