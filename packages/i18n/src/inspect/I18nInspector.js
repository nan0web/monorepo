import { AuditorModel } from '@nan0web/inspect'
import { progress, show, result } from '@nan0web/ui'
import { extract } from '../extract.js'

const EXCLUDE_DIRS = ['.git', '.nan0web', 'node_modules', 'dist', 'build', 'out', 'target', 'vendor', '.cache']

/**
 * I18nInspector — Validates i18n compliance across the project.
 * Scans for translation keys and verifies they exist in the vocabulary.
 */
export class I18nInspector extends AuditorModel {
	static alias = 'i18n'
	static UI = {
		title: 'i18n Standard Audit',
		scanning: 'Scanning {dir} for i18n compliance...',
		missing_keys: 'Found {count} potentially missing i18n keys.',
		untranslated_key: 'Key "{key}" in {file} is not found in vocabulary "{locale}".',
		ok: 'i18n standards: OK',
	}

	/**
	 * @param {any} data
	 * @param {any} options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { db, t } = this._
		const locale = this._.locale || 'uk'
		const targetDir = this.dir || '.'
		let absDir = targetDir
		if (!absDir.startsWith('@') && !absDir.startsWith('/') && !absDir.startsWith('~')) {
			absDir = `@app/${absDir.replace(/^\.\//, '')}`
		}
		// Ensure no trailing slash for consistent readDir behavior
		if (absDir.endsWith('/') && absDir.length > 1) {
			absDir = absDir.slice(0, -1)
		}

		yield progress(t(I18nInspector.UI.scanning, { dir: absDir }))

		const allFiles = []
		const collect = async (dir) => {
			try {
				// We use depth: 0 to prevent internal recursion in db.readDir
				// and handle it manually to skip excluded directories effectively.
				for await (const entry of db.readDir(dir, { depth: 0 })) {
					const entryName = entry.name
					if (!entryName || entryName.startsWith('.') || EXCLUDE_DIRS.includes(entryName)) {
						continue
					}

					const fullPath = entry.path || (dir.endsWith('/') ? `${dir}${entryName}` : `${dir}/${entryName}`)
					const isDir = entry.stat?.isDirectory || entry.isDirectory

					if (isDir) {
						await collect(fullPath)
					} else if (/\.(js|ts|jsx|tsx)$/.test(entryName) && !entryName.endsWith('.test.js')) {
						allFiles.push(fullPath)
					}
				}
			} catch (e) {
				// Silently skip
			}
		}

		await collect(absDir)
		yield progress(t(I18nInspector.UI.scanning, { dir: `${absDir} (${allFiles.length} files)` }))

		// Load vocabulary
		const vocabPath = `@app/data/${locale}/index.nan0`
		const vocabDoc = await db.loadDocument(vocabPath).catch(() => null)
		const vocabulary = vocabDoc && typeof vocabDoc === 'object' ? (vocabDoc.value || vocabDoc.content || vocabDoc) : {}
		const vocabKeys = new Set(Object.keys(vocabulary))

		let missingCount = 0
		let processed = 0

		for (const file of allFiles) {
			processed++

			const fileLabel = file.length > 50 ? '...' + file.substring(file.length - 47) : file
			yield progress(t(I18nInspector.UI.scanning, { dir: `${fileLabel} [${processed}/${allFiles.length}]` }))

			const doc = await db.loadDocument(file).catch(() => null)
			const content = typeof doc === 'object' && doc ? (doc.content || doc.value || '') : String(doc || '')

			if (typeof content === 'string') {
				const keys = extract(content)
				for (const key of keys) {
					if (!vocabKeys.has(key)) {
						missingCount++
						yield show(t(I18nInspector.UI.untranslated_key, { key, file, locale }), 'error')
					}
				}
			}
		}

		if (missingCount > 0) {
			return result({ success: false, errors: missingCount })
		}

		yield show(t(I18nInspector.UI.ok, {}), 'success')
		return result({ success: true })
	}
}

export default I18nInspector
