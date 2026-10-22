import { Model, merge, NaN0 } from '@nan0web/types'

/**
 * ReleaseConfig — Typed Configuration Model for @nan0web/release (Model-as-Schema v2).
 * Follows the 4-Tier Layered Configuration architecture:
 * 1. CLI Arguments & Flags (--releases-dir, etc.) [Priority 9]
 * 2. Environment Variables (RELEASE_DIR, RELEASE_CONFIG) [Priority 6]
 * 3. Configuration Files (release.config.{nan0,yaml,js}, package.json) [Priority 3]
 * 4. Hardcoded Defaults ('releases/') [Priority 0]
 */
export class ReleaseConfig extends Model {
	static alias = 'release-config'

	static releasesDir = {
		help: 'Base directory for PM-as-Code releases (default: "releases")',
		type: 'string',
		default: 'releases',
		errorInvalid: 'Property "releasesDir" must be a non-empty string',
		validate: (val) => (typeof val === 'string' && val.trim().length > 0) || ReleaseConfig.releasesDir.errorInvalid,
	}

	static rules = {
		help: 'Granular release verification rule settings (e.g. misplaced_backlog: "error" | "warning")',
		type: 'object',
		default: {
			misplaced_backlog: 'warning',
		},
		errorInvalid: 'Property "rules" must be an object',
		validate: (val) => (val && typeof val === 'object' && !Array.isArray(val)) || ReleaseConfig.rules.errorInvalid,
	}

	/**
	 * @param {Partial<ReleaseConfig> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		/** @type {string} Target directory for releases */
		this.releasesDir = String(data.releasesDir || (options && 'releasesDir' in options ? options.releasesDir : '') || ReleaseConfig.releasesDir.default).replace(/^\/+|\/+$/g, '') || 'releases'

		/** @type {Record<string, string>} Rule enforcement levels */
		this.rules =
			data.rules && typeof data.rules === 'object' && !Array.isArray(data.rules)
				? { ...ReleaseConfig.rules.default, ...data.rules }
				: { ...ReleaseConfig.rules.default }
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

		if (ext === '.nan0' || ext === '.yaml' || ext === '.yml') {
			try {
				return NaN0.parse(trimmed) || {}
			} catch {
				return {}
			}
		}

		if (ext === '.js') {
			try {
				const match = trimmed.match(/export\s+default\s+({[\s\S]*})/m)
				if (match) {
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
	 * Cascading loader for ReleaseConfig using @nan0web/db.
	 * Resolution priority:
	 * 1. Global: ~/.nan0web/release/config.{nan0,yaml,js}
	 * 2. Repo root: <repo_root>/release.config.{nan0,yaml,js}
	 * 3. Project: <target_dir>/release.config.{nan0,yaml,js} or package.json#release
	 * 4. Env: process.env.RELEASE_DIR
	 *
	 * @param {import('@nan0web/db').DB | any} db Injected database instance
	 * @param {string} [targetDir='.'] Target directory being audited
	 * @param {Partial<ReleaseConfig>} [cliOverrides={}] Explicit CLI arguments
	 * @returns {Promise<ReleaseConfig>} Resolved and merged ReleaseConfig
	 */
	static async load(db, targetDir = '.', cliOverrides = {}) {
		if (!db) {
			return new ReleaseConfig(cliOverrides)
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

				if (db.data && typeof db.data.get === 'function') {
					if (db.data.has(fullPath)) {
						const doc = db.data.get(fullPath)
						const parsed = typeof doc === 'object' ? doc : ReleaseConfig._parseRaw(String(doc), ext)
						if (parsed && typeof parsed === 'object') return parsed
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
							const parsed = typeof doc === 'object' ? doc : ReleaseConfig._parseRaw(String(doc), ext)
							if (parsed && typeof parsed === 'object') return parsed
						}
					}
				} catch {}
			}
			return null
		}

		// 1. Global config (~/.nan0web/release/config.*)
		try {
			for (const ext of extensions) {
				const tildePath = `~/.nan0web/release/config${ext}`
				if (db.data && typeof db.data.get === 'function' && db.data.has(tildePath)) {
					const doc = db.data.get(tildePath)
					const parsed = typeof doc === 'object' ? doc : ReleaseConfig._parseRaw(String(doc), ext)
					if (parsed) mergedData = merge(mergedData, parsed)
					break
				}
			}
		} catch {}

		// 2. Repo root config (release.config.*)
		const rootDoc = await tryLoadFile('', 'release.config')
		if (rootDoc) {
			mergedData = merge(mergedData, rootDoc)
		}

		// 3. Project config (<target_dir>/release.config.* or package.json#release)
		if (targetDir && targetDir !== '.' && targetDir !== './') {
			const projectDoc = await tryLoadFile(targetDir, 'release.config')
			if (projectDoc) {
				mergedData = merge(mergedData, projectDoc)
			}
		}

		// 4. Environment Variables overrides
		if (typeof process !== 'undefined' && process.env) {
			if (process.env.RELEASE_DIR) {
				mergedData.releasesDir = process.env.RELEASE_DIR
			}
		}

		// 5. Explicit CLI Overrides (Highest priority)
		if (cliOverrides && typeof cliOverrides === 'object') {
			mergedData = merge(mergedData, cliOverrides)
		}

		return new ReleaseConfig(mergedData, { db })
	}
}
