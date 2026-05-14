import { dirname, join, extname } from 'node:path'
import { execSync } from 'node:child_process'

/**
 * KBIndexer - Processes files into searchable datasets using @nan0web/db.
 */
export class KBIndexer {
	/**
	 * Builds a searchable dataset from a list of files using DB.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string[]} files List of file paths
	 * @param {string} outputDir Path to .datasets directory
	 * @returns {Promise<{ filesIndexed: number, chunksCreated: number }>}
	 */
	async build(db, files, outputDir) {
		let filesIndexed = 0
		let chunksCreated = 0
		const allChunks = []

		for (const file of files) {
			try {
				const content = await db.get(file, { defaultValue: '' })
				if (!content || !content.trim()) continue

				const rawChunks = content.split(/\n\n+/)

				for (const raw of rawChunks) {
					const trimmed = raw.trim()
					if (!trimmed) continue

					if (trimmed.length > 2000) {
						const sub = trimmed.match(/.{1,2000}/g) || []
						for (const s of sub) {
							allChunks.push({
								file,
								content: s,
								line: this.#findLineNumber(content, s),
							})
							chunksCreated++
						}
					} else {
						allChunks.push({
							file,
							content: trimmed,
							line: this.#findLineNumber(content, trimmed),
						})
						chunksCreated++
					}
				}
				filesIndexed++
			} catch (e) {
				continue
			}
		}

		await db.set(join(outputDir, 'chunks.json'), allChunks)
		return { filesIndexed, chunksCreated }
	}

	/**
	 * Downloads a package from a specific registry into a target directory.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} registry 'npm', 'pip', etc.
	 * @param {string} name Package name
	 * @param {string} targetDir
	 * @returns {Promise<void>}
	 */
	async downloadPackage(db, registry, name, targetDir) {
		const absTarget = db.absolute(targetDir)
		// We still use shell for 'pack' and 'tar' as they are native tools
		execSync(`mkdir -p ${absTarget}`, { stdio: 'ignore' })

		if (registry === 'npm') {
			execSync(`npm pack ${name} --pack-destination ${absTarget}`, { stdio: 'ignore' })
			execSync(`tar -xzf ${join(absTarget, '*.tgz')} --strip-components=1 -C ${absTarget}`, {
				stdio: 'ignore',
			})
			execSync(`rm -f ${join(absTarget, '*.tgz')}`, { stdio: 'ignore' })
		} else if (registry === 'pip') {
			execSync(`pip download ${name} -d ${absTarget} --no-deps`, { stdio: 'ignore' })
		} else {
			throw new Error(`Registry downloader not implemented for: ${registry}`)
		}
	}

	/**
	 * Force reindexes a directory.
	 *
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} dir
	 */
	async reindex(db, dir) {
		// reindex is higher-level logic usually handled by calling scanner then build.
		// For consistency, we keep the signature here.
	}

	#findLineNumber(fullText, chunkText) {
		const index = fullText.indexOf(chunkText)
		if (index === -1) return 1
		return fullText.substring(0, index).split('\n').length
	}
}
