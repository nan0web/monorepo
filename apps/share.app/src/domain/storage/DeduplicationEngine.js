/**
 * DeduplicationEngine - Identifies duplicate files across directories or multiple drives.
 */
export class DeduplicationEngine {
	/**
	 * Finds duplicates in a list of FileEntryModels or file objects.
	 * @param {Array<{ hash: string, size: number, relativePath: string, driveId?: string }>} files
	 * @returns {Array<{ hash: string, size: number, instances: Array<{ relativePath: string, driveId?: string }>, wastedBytes: number }>}
	 */
	findDuplicates(files = []) {
		const map = new Map()

		for (const file of files) {
			if (!file.hash) continue
			if (!map.has(file.hash)) {
				map.set(file.hash, {
					hash: file.hash,
					size: file.size || 0,
					instances: [],
				})
			}
			map.get(file.hash).instances.push(file)
		}

		const duplicates = []
		for (const entry of map.values()) {
			if (entry.instances.length > 1) {
				const extraCopies = entry.instances.length - 1
				duplicates.push({
					hash: entry.hash,
					size: entry.size,
					instances: entry.instances,
					wastedBytes: entry.size * extraCopies,
				})
			}
		}

		return duplicates
	}

	/**
	 * Compares source files against backup catalog to identify missing backup items.
	 * @param {Array<{ relativePath: string, hash: string, size: number }>} sourceFiles
	 * @param {Array<{ relativePath: string, hash: string, size: number }>} backupFiles
	 * @returns {{ missingInBackup: typeof sourceFiles, backedUpCount: number, missingBytes: number }}
	 */
	compareDrives(sourceFiles = [], backupFiles = []) {
		const backupHashes = new Set(backupFiles.map(f => f.hash || f.relativePath))
		const missingInBackup = []
		let backedUpCount = 0
		let missingBytes = 0

		for (const sf of sourceFiles) {
			const identifier = sf.hash || sf.relativePath
			if (backupHashes.has(identifier)) {
				backedUpCount++
			} else {
				missingInBackup.push(sf)
				missingBytes += Number(sf.size || 0)
			}
		}

		return {
			missingInBackup,
			backedUpCount,
			missingBytes,
		}
	}
}
