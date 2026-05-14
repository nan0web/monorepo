import { join, dirname, resolve } from 'node:path'

/**
 * KBSearcher - Performs cascading keyword search across local and external KB indices using @nan0web/db.
 */
export class KBSearcher {
	/**
	 * Search for a query inside a specific index (dataset) using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} query The search text
	 * @param {string} indexDir Directory where .datasets/chunks.json is located
	 * @param {object} opts { limit, threshold }
	 * @returns {Promise<any[]>} List of SearchHit
	 */
	async search(db, query, indexDir, opts = {}) {
		const chunksPath = join(indexDir, '.datasets/chunks.json')
		try {
			/** @type {any[]} */
			const chunks = await db.get(chunksPath, { defaultValue: [] })
			if (chunks.length === 0) return []

			const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
			if (terms.length === 0) return []

			const hits = []
			for (const chunk of chunks) {
				const text = chunk.content.toLowerCase()
				let score = 0

				for (const term of terms) {
					if (text.includes(term)) {
						score += 0.5
						if (text.includes(` ${term} `) || text.startsWith(`${term} `) || text.endsWith(` ${term}`)) {
							score += 0.2
						}
					}
				}

				if (score >= (opts.threshold || 0.5)) {
					hits.push({
						...chunk,
						score: Number(score.toFixed(2)),
						indexDir,
					})
				}
			}

			return hits
				.sort((a, b) => b.score - a.score)
				.slice(0, opts.limit || 10)
		} catch (e) {
			return []
		}
	}

	/**
	 * Resolves a package source to its index directory using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} source
	 * @returns {Promise<string | null>}
	 */
	async resolvePackageIndex(db, source) {
		const prefixMatch = source.match(/^(\w+):(.+)$/)
		let registry = 'npm'
		let name = source

		if (prefixMatch) {
			registry = prefixMatch[1]
			name = prefixMatch[2]
		}

		const registries = {
			npm: 'n',
			pip: 'p',
			crates: 'c',
			go: 'g',
			maven: 'j',
			composer: 'ph',
			gem: 'r',
			pub: 'pb',
			hex: 'h',
			github: 'gh',
		}

		const kbRoot = join(process.env.HOME || '.', '.llimo/kb/@')
		const regPath = registries[registry] || 'n'
		const absPath = join(kbRoot, regPath, name)

		const st = await db.stat(absPath); if (st && st.exists) {
			return absPath
		}

		const local = resolve(process.cwd(), source)
		const localStat = await db.stat(local)
		if (localStat && localStat.exists && localStat.isDirectory) {
			return local
		}

		return null
	}

	/**
	 * Lists other indexed local projects in the monorepo root using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @returns {Promise<string[]>} List of absolute paths
	 */
	async listLocalProjects(db) {
		const parent = dirname(process.cwd())
		const results = []
		try {
			const entries = await db.listDir(parent)
			for (const entry of entries) {
				if (entry.stat.isDirectory && !entry.name.startsWith('.')) {
					const full = join(parent, entry.name)
					const datasets = await db.stat(join(full, '.datasets'))
					if (datasets && datasets.exists) {
						results.push(full)
					}
				}
			}
		} catch (e) {}
		return results
	}

	/**
	 * Lists all indexed external packages in total using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @returns {Promise<string[]>} List of absolute paths
	 */
	async listExternalPackages(db) {
		const kbRoot = join(process.env.HOME || '.', '.llimo/kb/@')
		const results = []
		try {
			const subdirs = await db.listDir(kbRoot)
			for (const sub of subdirs) {
				if (sub.stat.isDirectory) {
					const regDir = join(kbRoot, sub.name)
					const packages = await db.listDir(regDir)
					for (const pkg of packages) {
						if (pkg.stat.isDirectory) {
							results.push(join(regDir, pkg.name))
						}
					}
				}
			}
		} catch (e) {}
		return results
	}

	/**
	 * Finds unindexed dependencies in a search hits list.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {any[]} hits
	 * @param {string} cwd
	 * @returns {Promise<any[]>}
	 */
	async findUnindexedDependencies(db, hits, cwd) {
		return []
	}
}
