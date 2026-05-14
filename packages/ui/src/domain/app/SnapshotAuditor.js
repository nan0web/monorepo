import { NaN0 } from '@nan0web/types'
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'

import { result, show, progress } from '../../core/Intent.js'

/**
 * SnapshotAuditor — Zero-Hallucination Snapshot Validation (Model-as-Schema v2).
 * Parses snapshots without evaluating the app logic and detects artifacts.
 */
export class SnapshotAuditor extends AuditorModel {
	static alias = 'snapshots'

	static dir = {
		type: 'string',
		help: 'Target directory to audit snapshots in',
		positional: true,
		default: 'snapshots/core',
	}

	static data = {
		type: 'string',
		help: 'Directory to scan for dictionaries',
		default: 'data',
	}

	static UI = {
		title: 'Snapshot Auditor',
		description: 'Validates UI snapshots against hallucinations and localization leaks.',
		icon: '📸',
		starting: 'Auditing snapshots in {dir}',
		noSnapshots: 'No snapshots found to audit in {dir}',
		doneSuccess: 'All snapshots passed the audit.',
		doneErrors: 'Gallery audit failed with errors. Check above.',
		auditPassed: 'Audit passed: {file}',
		auditFailed: 'Audit failed for {file}: {errors}',

		errorDb: 'Database not provided to auditor',
		errorGlitch: 'Filename "{filename}" has multiple consecutive separators (glitch detected).',
		errorShort: 'Filename "{filename}" is too short.',
		errorSyntax: 'Syntax Error: Failed to parse NaN0 file. {msg}',
		errorArtifact: 'Path {path}: Critical artifact "{artifact}" found.',
		errorRouting: 'Path {path}: Routing error "Path not found".',
		errorUntranslated: 'Path {path}: Possible untranslated key found: "{str}"',
		errorEnglishLeak: 'Path {path}: English word "{word}" found in "{locale}" locale.',
		errorEmptyRender:
			'Path {path}.{key}: Snapshot is suspiciously empty (pure tag {compName} with NO properties or content).',
		errorForeignLeak:
			'Path {path}: Word "{word}" belongs to "{foreign}" but is missing in "{locale}".',
	}

	/** @type {string[]} Common UI components that can be empty in render */
	static EXEMPT_EMPTY = ['ui-spinner', 'ui-themetoggle', 'ui-langselect', 'ui-sortable']

	/** @type {string[]} Critical JS artifacts to detect in snapshots */
	static ARTIFACTS = ['[object Object]', 'undefined', 'NaN']

	/** @type {string[]} Words to ignore across all languages */
	static EXEMPT_WORDS = [
		'true',
		'false',
		'value',
		'max',
		'min',
		'step',
		'open',
		'first',
		'what',
		'how',
		'start',
		'code',
		'successfully',
		'enter',
		'with',
		'system',
	]

	/** @type {RegExp} Pattern for suspicious filenames */
	static SUSPICIOUS_FILENAME = /__|--/

	/** @type {number} Minimum filename length */
	static MIN_FILENAME_LENGTH = 3

	/** @type {string[]} Directories to ignore during scanning */
	static IGNORE_DIRS = ['node_modules', '.git', '.venv', '.datasets', 'dist', 'build', 'types']

	/**
	 * Checks if a directory or file should be ignored.
	 * @param {string} name
	 * @returns {boolean}
	 */
	static isIgnored(name) {
		return name.startsWith('.') || SnapshotAuditor.IGNORE_DIRS.includes(name)
	}

	/**
	 * @param {Partial<SnapshotAuditor> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target directory to audit */ this.dir
		/** @type {string} Directory to scan for dictionaries */ this.data
	}

	/**
	 * Extracts all valid words from an object into a Set.
	 * @param {any} obj Node to extract from.
	 * @param {Set<string>} set Set to populate.
	 */
	static extractWords(obj, set) {
		if (typeof obj === 'string') {
			const words = obj.toLowerCase().split(/[\s,.:;!"'(){}\[\]\\/<>?=\-+_@&#*^|~`]+/)
			for (const w of words) {
				if (w.length > 2 && isNaN(Number(w))) set.add(w)
			}
		} else if (Array.isArray(obj)) {
			for (const item of obj) SnapshotAuditor.extractWords(item, set)
		} else if (obj && typeof obj === 'object') {
			for (const val of Object.values(obj)) SnapshotAuditor.extractWords(val, set)
		}
	}

	/**
	 * Scans data directories to build a word set for each language.
	 * @param {import('@nan0web/db').DB} fsDb FileSystem DB.
	 * @param {string} data
	 * @returns {Promise<Record<string, Set<string>>>}
	 */
	static async buildDictionaries(fsDb, data = 'data') {
		/** @type {Record<string, Set<string>>} */
		const dicts = {}

		try {
			// Find all language directories
			const entries = await fsDb
				.listDir(data)
				.catch(async (e) => {
					if (/** @type {any} */ (e).code === 'ENOENT' && !data.startsWith('../')) {
						return await fsDb.listDir('../' + data)
					}
					throw e
				})
				.catch(() => [])

			for (const entry of entries) {
				if (entry.stat.isDirectory && entry.name !== '_') {
					const lang = entry.name
					if (!dicts[lang]) dicts[lang] = new Set()

					// Use browse for deep dictionary scanning
					for await (const f of fsDb.browse(entry.path, { depth: Infinity })) {
						if (SnapshotAuditor.isIgnored(f.name)) continue
						if (f.isFile) {
							try {
								const raw = await fsDb.fetch(f.path)
								SnapshotAuditor.extractWords(raw, dicts[lang])
							} catch (e) {}
						}
					}
				}
			}
		} catch (e) {
			// Ignore dictionary errors
		}
		return dicts
	}

	/**
	 * Run the snapshot audit inside the target directory.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._

		yield show(t(SnapshotAuditor.UI.starting, { dir: this.dir }))

		const fsDb = this._.db

		if (!fsDb) {
			yield show(t(SnapshotAuditor.UI.errorDb), 'error')
			return result({ success: false })
		}

		const files = []
		const snapshotsDir = fsDb.resolveSync(this.dir || '.', 'snapshots/core')

		// Use robust DB.browse for recursive snapshot detection
		try {
			for await (const entry of fsDb.browse(snapshotsDir, { depth: Infinity })) {
				if (SnapshotAuditor.isIgnored(entry.name)) continue
				if (entry.isFile && (entry.name.endsWith('.nan0') || entry.name.endsWith('.txt'))) {
					files.push(entry.path)
				}
			}
		} catch (e) {
			// Directory might be missing
		}

		if (files.length === 0) {
			yield show(t(SnapshotAuditor.UI.noSnapshots, { dir: this.dir }), 'error')
			return result({ success: false })
		}

		// Preload all dictionaries into memory across all languages
		const dictionaries = await SnapshotAuditor.buildDictionaries(fsDb, this.data || 'data')

		// Process all files in parallel for hyper-speed
		const auditPromises = files.map(async (file) => {
			const segments = file.split('/')
			const locale = segments[segments.indexOf('core') + 1] || 'uk'
			const componentName = segments.pop() || ''

			const content = await fsDb.fetch(file)
			const textContent = typeof content === 'string' ? content : JSON.stringify(content)

			return {
				file,
				audit: SnapshotAuditor.inspectText(textContent, locale, componentName, t, dictionaries),
			}
		})

		const results = await Promise.all(auditPromises)
		const allErrors = []
		let hasErrors = false

		for (const { file, audit } of results) {
			const displayFile = file.startsWith('@app/') ? file.slice(5) : file
			if (audit.score < 100) {
				const errorMessages = audit.errors.join('; ')
				yield show(
					t(SnapshotAuditor.UI.auditFailed, { file: displayFile, errors: errorMessages }),
					'error',
				)
				allErrors.push(...audit.errors.map((e) => ({ file: displayFile, error: e })))
				hasErrors = true
			} else {
				yield progress(t(SnapshotAuditor.UI.auditPassed, { file: displayFile }))
			}
		}

		if (hasErrors) {
			yield show(t(SnapshotAuditor.UI.doneErrors, {}), 'error')
			return result({ success: false, errors: allErrors })
		}

		yield show(t(SnapshotAuditor.UI.doneSuccess, {}), 'success')
		return result({ success: true })
	}

	/**
	 * Inspects a single snapshot text.
	 * @param {string} content Content of the file.
	 * @param {string} locale Locale (uk, en).
	 * @param {string} filename Name of the file.
	 * @param {import('@nan0web/i18n').TFunction} t Translate function.
	 * @param {Record<string, Set<string>>} [dictionaries=undefined] Loaded dictionaries for mutual exclusion check.
	 * @returns {{ score: number, errors: string[] }}
	 */
	static inspectText(content, locale, filename, t, dictionaries = undefined) {
		const errors = []

		if (filename) {
			if (SnapshotAuditor.SUSPICIOUS_FILENAME.test(filename)) {
				errors.push(t(SnapshotAuditor.UI.errorGlitch, { filename }))
			}
			if (filename.length < SnapshotAuditor.MIN_FILENAME_LENGTH) {
				errors.push(t(SnapshotAuditor.UI.errorShort, { filename }))
			}
		}

		let parsed
		try {
			parsed = NaN0.parse(content)
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			errors.push(t(SnapshotAuditor.UI.errorSyntax, { msg }))
			return { score: 0, errors }
		}

		const context = { locale, errors, t, dictionaries }
		SnapshotAuditor.checkNode(parsed, '$', context)

		return {
			score: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 10),
			errors,
		}
	}

	/**
	 * Recursively checks a parsed node.
	 * @param {any} node Node.
	 * @param {string} path JSON path.
	 * @param {{ locale: string, errors: string[], t: import('@nan0web/i18n').TFunction, dictionaries?: Record<string, Set<string>> }} context Context.
	 */
	static checkNode(node, path, context) {
		if (typeof node === 'string') {
			SnapshotAuditor.checkString(node, path, context)
		} else if (Array.isArray(node)) {
			node.forEach((item, i) => SnapshotAuditor.checkNode(item, `${path}[${i}]`, context))
		} else if (node && typeof node === 'object') {
			for (const [key, value] of Object.entries(node)) {
				SnapshotAuditor.checkString(key, `${path}.key(${key})`, context)
				SnapshotAuditor.checkNode(value, `${path}.${key}`, context)

				if (key === 'render' && value && typeof value === 'object') {
					for (const [compName, compProps] of Object.entries(value)) {
						if (compProps && typeof compProps === 'object' && Object.keys(compProps).length === 0) {
							if (!SnapshotAuditor.EXEMPT_EMPTY.includes(compName)) {
								context.errors.push(
									context.t(SnapshotAuditor.UI.errorEmptyRender, {
										path,
										key,
										compName,
									}),
								)
							}
						}
					}
				}
			}
		}
	}

	/**
	 * Checks a string node.
	 * @param {string} str String.
	 * @param {string} path Path.
	 * @param {{ locale: string, errors: string[], t: import('@nan0web/i18n').TFunction, dictionaries?: Record<string, Set<string>> }} context Context.
	 */
	static checkString(str, path, context) {
		const { t, locale, errors } = context

		for (const artifact of SnapshotAuditor.ARTIFACTS) {
			if (str.includes(artifact)) {
				// Special check for NaN to avoid false positives with NaN0 or NaN•
				if (artifact === 'NaN' && (str.includes('NaN0') || str.includes('NaN•'))) continue
				errors.push(t(SnapshotAuditor.UI.errorArtifact, { path, artifact }))
			}
		}

		if (str.includes('Path not found')) errors.push(t(SnapshotAuditor.UI.errorRouting, { path }))

		const isSystemProp =
			path.includes('.variant') || path.includes('.key(') || path.includes('.ask')
		if (!isSystemProp) {
			const isDotNumber = /^-?\d+\.\d+$/.test(str)
			const hasParens = str.includes('(') || str.includes(')')
			const isEmail = str.includes('@')

			if (
				/\w+\.\w+/.test(str) &&
				!str.includes('ui-') &&
				!str.includes('http') &&
				!isDotNumber &&
				!hasParens &&
				!isEmail
			) {
				errors.push(t(SnapshotAuditor.UI.errorUntranslated, { path, str }))
			}

			if (context.dictionaries && context.dictionaries[locale]) {
				const myWords = context.dictionaries[locale]
				const words = str.toLowerCase().split(/[\s,.:;!"'(){}\[\]\\/<>?=\-+_@&#*^|~`]+/)

				for (const word of words) {
					if (word.length <= 2 || !isNaN(Number(word))) continue
					if (SnapshotAuditor.EXEMPT_WORDS.includes(word)) continue
					if (myWords.has(word)) continue

					/** @type {string | false} */
					let foundInForeign = false
					for (const [otherLoc, otherSet] of Object.entries(context.dictionaries)) {
						if (otherLoc !== locale && otherSet.has(word)) {
							foundInForeign = otherLoc
							break
						}
					}

					if (foundInForeign) {
						errors.push(
							t(SnapshotAuditor.UI.errorForeignLeak, {
								path,
								word,
								foreign: foundInForeign,
								locale,
							}),
						)
					}
				}
			}
		}
	}
}

export default SnapshotAuditor
