import { join } from 'node:path'
import { createHash } from 'node:crypto'

/**
 * KBHashStore - Manages hashes for LLiMo Knowledge Base incremental updates.
 * Using @nan0web/db for internal persistence.
 */
export class KBHashStore {
	/**
	 * Computes a deterministic aggregate hash for a list of files.
	 *
	 * @param {string[]} files List of file paths
	 * @returns {string} SHA-256 hex string
	 */
	compute(files) {
		const hash = createHash('sha256')
		const sorted = [...files].sort()
		for (const f of sorted) {
			hash.update(f)
		}
		return hash.digest('hex')
	}

	/**
	 * Reads the stored hash for a given directory using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} dir Root directory of the package/project
	 * @returns {Promise<string | null>}
	 */
	async read(db, dir) {
		const hashPath = join(dir, '.datasets/hash')
		return await db.get(hashPath, { defaultValue: null })
	}

	/**
	 * Writes the hash to the directory's dataset store using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} dir Root directory
	 * @param {string} hash Hash string
	 * @returns {Promise<void>}
	 */
	async write(db, dir, hash) {
		const hashPath = join(dir, '.datasets/hash')
		await db.set(hashPath, hash)
	}

	/**
	 * Checks if the index in the given directory is stale compared to its current files.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} dir
	 * @param {string[]} currentFiles
	 * @returns {Promise<boolean>}
	 */
	async isStale(db, dir, currentFiles) {
		const stored = await this.read(db, dir)
		if (!stored) return true
		const current = this.compute(currentFiles)
		return stored !== current
	}
}
