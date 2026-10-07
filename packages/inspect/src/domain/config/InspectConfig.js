import { Model, merge, NaN0 } from '@nan0web/types'

/**
 * @typedef {Object} ThemingConfig
 * @property {string[]} [ignorePatterns] Regex or string patterns to ignore in theming audit.
 * @property {string[]} [ignoreDirs] Directory names to ignore during theming scan.
 */

/**
 * @typedef {Object} SnapshotsConfig
 * @property {boolean} [optional] Allow audit to pass if snapshots directory does not exist.
 * @property {boolean} [allowEmpty] Allow audit to pass if no snapshots are found.
 * @property {string} [dir] Target snapshots directory (default: 'snapshots/core').
 */

/**
 * InspectConfig — Typed Configuration Model for @nan0web/inspect (Model-as-Schema v2).
 */
export class InspectConfig extends Model {
	static include = {
		help: 'Auditor aliases or names to explicitly include (whitelist)',
		type: 'string[]',
		default: [],
		errorInvalid: 'Property "include" must be an array of strings',
		validate: (val) => Array.isArray(val) || InspectConfig.include.errorInvalid,
	}

	static skip = {
		help: 'Auditor aliases or names to exclude from execution',
		type: 'string[]',
		default: [],
		errorInvalid: 'Property "skip" must be an array of strings',
		validate: (val) => Array.isArray(val) || InspectConfig.skip.errorInvalid,
	}

	static modules = {
		help: 'Specific auditor/module configuration settings',
		type: 'object',
		default: {},
		errorInvalid: 'Property "modules" must be an object',
		validate: (val) =>
			(val && typeof val === 'object' && !Array.isArray(val)) || InspectConfig.modules.errorInvalid,
	}

	static theming = {
		help: 'OLMUI Theming Auditor exception configuration',
		type: 'object',
		default: { ignorePatterns: [], ignoreDirs: [] },
		errorInvalid: 'Property "theming" must be an object',
		validate: (val) =>
			(val && typeof val === 'object' && !Array.isArray(val)) || InspectConfig.theming.errorInvalid,
	}

	static snapshots = {
		help: 'SnapshotAuditor validation configuration',
		type: 'object',
		default: { optional: false, allowEmpty: false, dir: 'snapshots/core' },
		errorInvalid: 'Property "snapshots" must be an object',
		validate: (val) =>
			(val && typeof val === 'object' && !Array.isArray(val)) ||
			InspectConfig.snapshots.errorInvalid,
	}

	static rules = {
		help: 'Granular heuristic rule toggles',
		type: 'object',
		default: {},
		errorInvalid: 'Property "rules" must be an object',
		validate: (val) =>
			(val && typeof val === 'object' && !Array.isArray(val)) || InspectConfig.rules.errorInvalid,
	}

	/**
	 * @param {Partial<InspectConfig> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		/** @type {string[]} Whitelist of auditor aliases to run exclusively */
		this.include = Array.isArray(this.include) ? [...this.include] : this.include

		/** @type {string[]} Auditor aliases to skip */
		this.skip = Array.isArray(this.skip) ? [...this.skip] : this.skip

		/** @type {Record<string, any>} Module-specific configurations */
		this.modules =
			this.modules && typeof this.modules === 'object' && !Array.isArray(this.modules)
				? { ...this.modules }
				: {}

		// Sync legacy / top-level theming and snapshots with modules
		const effectiveTheming = this.modules?.theming || this.theming
		/** @type {ThemingConfig} Theming options */
		this.theming =
			effectiveTheming && typeof effectiveTheming === 'object' && !Array.isArray(effectiveTheming)
				? {
						ignorePatterns: Array.isArray(effectiveTheming.ignorePatterns)
							? [...effectiveTheming.ignorePatterns]
							: [],
						ignoreDirs: Array.isArray(effectiveTheming.ignoreDirs)
							? [...effectiveTheming.ignoreDirs]
							: [],
					}
				: this.theming

		const effectiveSnapshots = this.modules?.snapshots || this.snapshots
		/** @type {SnapshotsConfig} Snapshots options */
		this.snapshots =
			effectiveSnapshots &&
			typeof effectiveSnapshots === 'object' &&
			!Array.isArray(effectiveSnapshots)
				? {
						optional: false,
						allowEmpty: false,
						dir: 'snapshots/core',
						...effectiveSnapshots,
					}
				: this.snapshots

		// Sync back to modules for consistency
		if (!this.modules.theming && this.theming) {
			this.modules.theming = this.theming
		}
		if (!this.modules.snapshots && this.snapshots) {
			this.modules.snapshots = this.snapshots
		}

		/** @type {Record<string, boolean>} Granular rule flags */
		this.rules =
			this.rules && typeof this.rules === 'object' && !Array.isArray(this.rules)
				? { ...this.rules }
				: this.rules
	}

	/**
	 * Parses raw configuration content depending on extension.
	 * @param {string} raw
	 * @param {string} ext
	 * @returns {Record<string, any>}
	 * @private
	 */
	static _parseRaw(raw, ext) {
		if (!raw || typeof raw !== 'string') return typeof raw === 'object' && raw ? raw : {}
		const trimmed = raw.trim()
		if (!trimmed) return {}

		if (ext === '.json') {
			try {
				return JSON.parse(trimmed)
			} catch {
				return {}
			}
		}

		// .nan0 or .yaml
		if (ext === '.nan0' || ext === '.yaml' || ext === '.yml') {
			try {
				return NaN0.parse(trimmed) || {}
			} catch {
				return {}
			}
		}

		// .js file content: extract object via basic regex or eval fallback if static
		if (ext === '.js') {
			try {
				// Try JSON-like or module export parsing
				const match = trimmed.match(/export\s+default\s+({[\s\S]*})/m)
				if (match) {
					// Use Function constructor in isolated scope without external globals
					const fn = new Function(`return (${match[1]})`)
					return fn() || {}
				}
			} catch {
				return {}
			}
		}

		return {}
	}

	/**
	 * Cascading loader for InspectConfig using @nan0web/db.
	 * Resolution priority:
	 * 1. Global: ~/.nan0web/inspect/config.nan0
	 * 2. Repo root: <repo_root>/inspect.config.{nan0,yaml,js}
	 * 3. Project: <target_dir>/inspect.config.{nan0,yaml,js}
	 *
	 * Merges configurations without procedural fs calls.
	 *
	 * @param {import('@nan0web/db').DB | any} db Injected database instance
	 * @param {string} [targetDir='.'] Target directory being audited
	 * @returns {Promise<InspectConfig>} Resolved and merged InspectConfig
	 */
	static async load(db, targetDir = '.') {
		if (!db) {
			return new InspectConfig()
		}

		const extensions = ['.nan0', '.yaml', '.yml', '.js', '.json']
		let mergedData = {}

		const tryLoadFile = async (basePath, filenameWithoutExt) => {
			for (const ext of extensions) {
				const fullPath = basePath
					? typeof db.resolveSync === 'function'
						? db.resolveSync(basePath, `${filenameWithoutExt}${ext}`)
						: `${basePath}/${filenameWithoutExt}${ext}`
					: `${filenameWithoutExt}${ext}`

				// Check in db.data first (for in-memory / predefined DB without mount)
				if (db.data && typeof db.data.get === 'function') {
					if (db.data.has(fullPath)) {
						const doc = db.data.get(fullPath)
						const parsed = typeof doc === 'object' ? doc : InspectConfig._parseRaw(String(doc), ext)
						if (parsed && typeof parsed === 'object') {
							return parsed
						}
					}
				}

				try {
					let stat = null
					if (typeof db.statDocument === 'function') {
						stat = await db.statDocument(fullPath)
					}
					if (!stat || stat.exists) {
						const doc = await db.loadDocument(fullPath)
						if (doc) {
							const parsed =
								typeof doc === 'object' ? doc : InspectConfig._parseRaw(String(doc), ext)
							if (parsed && typeof parsed === 'object') {
								return parsed
							}
						}
					}
				} catch {
					// File does not exist or unreadable, continue search
				}
			}
			return null
		}

		// 1. Global configuration (~/.nan0web/inspect/config.nan0 or similar)
		try {
			// First try in db.data for '~/.nan0web/inspect/config.*'
			let globalDoc = null
			for (const ext of extensions) {
				const tildePath = `~/.nan0web/inspect/config${ext}`
				if (db.data && typeof db.data.get === 'function' && db.data.has(tildePath)) {
					const doc = db.data.get(tildePath)
					globalDoc = typeof doc === 'object' ? doc : InspectConfig._parseRaw(String(doc), ext)
					break
				}
			}
			if (!globalDoc) {
				globalDoc = await tryLoadFile('~/.nan0web/inspect', 'config')
			}
			if (globalDoc) {
				mergedData = merge(mergedData, globalDoc)
			}
		} catch {}

		// 2. Repo root configuration (<repo_root>/inspect.config.{nan0,yaml,js})
		const rootDoc = await tryLoadFile('', 'inspect.config')
		if (rootDoc) {
			mergedData = merge(mergedData, rootDoc)
		}

		// 3. Project configuration (<target_dir>/inspect.config.{nan0,yaml,js})
		if (targetDir && targetDir !== '.' && targetDir !== './') {
			const projectDoc = await tryLoadFile(targetDir, 'inspect.config')
			if (projectDoc) {
				mergedData = merge(mergedData, projectDoc)
			}
		}

		return new InspectConfig(mergedData, { db })
	}
}
