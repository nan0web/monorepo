import { join, extname } from 'node:path'

/**
 * KBScanner - Scans directories and detects project registries using @nan0web/db.
 */
export class KBScanner {
	/**
	 * Scans a directory for indexable files using DB traversal.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} dir Root directory to scan
	 * @param {object} priorities { high: string[], low: string[] } extensions
	 * @param {string[]} ignore Glob patterns to ignore
	 * @returns {Promise<string[]>} List of RELATIVE file paths
	 */
	async scan(db, dir, priorities, ignore) {
		const results = { high: /** @type {string[]} */([]), normal: /** @type {string[]} */([]), low: /** @type {string[]} */([]) }
		const highExts = new Set(priorities.high)
		const lowExts = new Set(priorities.low)

		// Using db.readDir to traverse
		for await (const entry of /** @type {any} */ (db).readDir(dir, { recursive: true })) {
			if (entry.stat.isDirectory) continue

			const relPath = entry.path
			const ext = extname(relPath).toLowerCase()

			// Simple ignore check (could be enhanced with micromatch if DB driver doesn't handle it)
			if (ignore.some((p) => relPath.includes(p))) continue

			if (highExts.has(ext)) {
				results.high.push(/** @type {any} */ (relPath))
			} else if (lowExts.has(ext)) {
				results.low.push(/** @type {any} */ (relPath))
			} else if (['.md', '.txt', '.json', '.yaml', '.yml'].includes(ext)) {
				results.normal.push(/** @type {any} */ (relPath))
			}
		}

		return [...results.high, ...results.normal, ...results.low]
	}

	/**
	 * Detects which registries are used in a directory using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} dir Root directory
	 * @param {Record<string, string>} dependencyFiles Mapping of registry -> file
	 * @returns {Promise<string[]>} List of detected registry keys
	 */
	async detectRegistries(db, dir, dependencyFiles) {
		const detected = []
		for (const [file, registry] of Object.entries(dependencyFiles)) {
			const stat = await db.stat(join(dir, file))
			if (stat && stat.exists) {
				detected.push(registry)
			}
		}
		return detected
	}
}
