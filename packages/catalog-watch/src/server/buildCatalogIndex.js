import { CatalogIndexModel } from '../domain/CatalogIndexModel.js'
import { runGenerator } from '@nan0web/ui/core'

/**
 * @file buildCatalogIndex — SSG Plugin Adapter.
 *
 * Bridges CatalogIndexModel (agnostic logic) to real Node.js environment:
 * - `node:fs` for directory scanning
 * - `node:crypto` for SHA-256 hashing
 * - `node:fs` for writing the output .index.txt
 *
 * Zero hardcoded UI text — all messages come from CatalogIndexModel.UI.
 *
 * @example
 * import { buildCatalogIndex } from '@nan0web/catalog-watch/server'
 * await buildCatalogIndex({ root: 'data', locale: 'uk', catalog: 'cards', outDir: 'dist' })
 * // → writes dist/@catalog/uk/cards.index.txt
 */

/**
 * @typedef {Object} BuildOptions
 * @property {string} root - Root data directory (e.g. 'data')
 * @property {string} catalog - Catalog name (e.g. 'cards')
 * @property {string} [locale='en'] - Language code
 * @property {string} [outDir='dist'] - Output directory
 * @property {boolean} [silent=false] - Suppress console output
 */

/**
 * Build a catalog index file during SSG.
 *
 * @param {BuildOptions} options
 * @returns {Promise<{ success: boolean, path?: string, version?: number, hash?: string, itemCount?: number }>}
 */
export async function buildCatalogIndex(options) {
	const { root, catalog, locale = 'en', outDir = 'dist', silent = false } = options

	// Dynamic imports (Node.js only — never bundled for browser)
	const { readdir, writeFile, mkdir, readFile } = await import('node:fs/promises')
	const { createHash } = await import('node:crypto')
	const { join, resolve } = await import('node:path')

	const rootPath = resolve(root)
	const outputDir = join(resolve(outDir), '@catalog', locale)
	const outputPath = join(outputDir, `${catalog}.index.txt`)

	// Create the CatalogIndexModel with initial data
	const model = new CatalogIndexModel({ catalog, locale })

	// Real environment (injected into agnostic model)
	const env = {
		/**
		 * List all files in the catalog directory (relative paths).
		 * @param {string} dirPath - Relative path like 'uk/cards'
		 * @returns {Promise<string[]>}
		 */
		async listFiles(dirPath) {
			const fullPath = join(rootPath, dirPath)
			try {
				const entries = await readdir(fullPath, { recursive: true })
				return entries
					.filter(e => !e.startsWith('.') && !e.startsWith('_'))
					.sort()
			} catch {
				return []
			}
		},

		/**
		 * Compute SHA-256 hash of all file contents concatenated.
		 * @param {string[]} files - Relative file paths
		 * @returns {Promise<string>}
		 */
		async hash(files) {
			const h = createHash('sha256')
			const dirPath = join(rootPath, locale, catalog)
			for (const file of files) {
				try {
					const content = await readFile(join(dirPath, file))
					h.update(content)
				} catch {
					h.update(file) // fallback: hash the filename
				}
			}
			return h.digest('hex').slice(0, 12)
		},

		/**
		 * Read previous version from existing index file (if any).
		 * @param {string} cat - Catalog name
		 * @param {string} loc - Locale
		 * @returns {Promise<number>}
		 */
		async readVersion(cat, loc) {
			const existingPath = join(resolve(outDir), '@catalog', loc, `${cat}.index.txt`)
			try {
				const content = await readFile(existingPath, 'utf8')
				const existing = CatalogIndexModel.parse(content)
				return existing.version
			} catch {
				return 0
			}
		},
	}

	// Run the generator through runGenerator with adapter handlers
	const data = await runGenerator(model.run(env), {
		ask: async () => ({ value: true }), // SSG never asks — auto-confirm
		progress: silent ? undefined : (intent) => {
			process.stdout.write(`  ⏳ ${intent.message}\n`)
		},
		log: silent ? undefined : (intent) => {
			const icon = { info: 'ℹ', warn: '⚠', error: '✖', success: '✔' }
			process.stdout.write(`  ${icon[intent.level] || '•'} ${intent.message}\n`)
		},
	})

	if (!data?.success) {
		return { success: false }
	}

	// Write the .index.txt file
	await mkdir(outputDir, { recursive: true })
	await writeFile(outputPath, data.content, 'utf8')

	return {
		success: true,
		path: outputPath,
		version: data.version,
		hash: data.hash,
		itemCount: data.itemCount,
	}
}
