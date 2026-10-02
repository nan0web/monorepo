/**
 * ModuleItem represents an inspected module/package in the workspace.
 * Wraps package.json and tsconfig.json metadata with canonical UI and profile detection.
 */
export class ModuleItem {
	/**
	 * @param {object} options
	 * @param {string} options.dir - Directory of the module relative to workspace (e.g. 'packages/foo')
	 * @param {Record<string, any>} [options.pkg] - Parsed package.json
	 * @param {Record<string, any>} [options.tsconfig] - Parsed tsconfig.json
	 * @param {import('@nan0web/db').DB} [options.db] - DB instance
	 */
	constructor({ dir, pkg = {}, tsconfig = {}, db = null }) {
		this.dir = dir
		this.pkg = pkg
		this.tsconfig = tsconfig
		this.db = db
		this._dirty = false
		this.warnings = []

		this.ui = this._resolveCanonicalUi()
		this.profile = this._resolveProfile()
	}

	get name() {
		return this.pkg.name || this.dir
	}

	get version() {
		return this.pkg.version || '0.0.0'
	}

	get private() {
		return Boolean(this.pkg.private)
	}

	/**
	 * Resolves canonical UI tags strictly from package.json exports,
	 * falling back to canonical package name pattern (@nan0web/ui-*).
	 *
	 * Subpaths:
	 * - ./ui/react or ./react -> 'ui-react'
	 * - ./ui/lit or ./lit -> 'ui-lit'
	 * - ./ui/cli or ./cli -> 'ui-cli'
	 * - ./ui/web, ./web, or ./dom -> 'ui-web'
	 *
	 * @returns {string[]}
	 * @private
	 */
	_resolveCanonicalUi() {
		const uiTags = new Set()
		const exports = this.pkg.exports || {}

		// 1. Inspect exports subpaths
		if (exports['./ui/react'] || exports['./react']) uiTags.add('ui-react')
		if (exports['./ui/lit'] || exports['./lit']) uiTags.add('ui-lit')
		if (exports['./ui/cli'] || exports['./cli']) uiTags.add('ui-cli')
		if (exports['./ui/web'] || exports['./web'] || exports['./dom']) uiTags.add('ui-web')

		// 2. Canonical package name pattern (@nan0web/ui-*)
		if (typeof this.pkg.name === 'string') {
			if (this.pkg.name === '@nan0web/ui-react' || this.pkg.name.endsWith('/ui-react')) {
				uiTags.add('ui-react')
			} else if (this.pkg.name === '@nan0web/ui-lit' || this.pkg.name.endsWith('/ui-lit')) {
				uiTags.add('ui-lit')
			} else if (this.pkg.name === '@nan0web/ui-cli' || this.pkg.name.endsWith('/ui-cli')) {
				uiTags.add('ui-cli')
			} else if (this.pkg.name === '@nan0web/ui-web' || this.pkg.name.endsWith('/ui-web')) {
				uiTags.add('ui-web')
			}
		}

		// 3. Warning heuristic: if dependencies contain UI libs but lacks export
		const allDeps = {
			...this.pkg.dependencies,
			...this.pkg.devDependencies,
			...this.pkg.peerDependencies,
		}
		if ((allDeps.react || allDeps['react-dom']) && !uiTags.has('ui-react')) {
			this.warnings.push(
				`Module ${this.name} has react dependency but lacks canonical './ui/react' export`
			)
		}
		if (allDeps.lit && !uiTags.has('ui-lit')) {
			this.warnings.push(
				`Module ${this.name} has lit dependency but lacks canonical './ui/lit' export`
			)
		}

		return Array.from(uiTags)
	}

	/**
	 * Detects TypeScript profile (node, react, lit)
	 * @returns {'node' | 'react' | 'lit'}
	 * @private
	 */
	_resolveProfile() {
		const allDeps = {
			...this.pkg.dependencies,
			...this.pkg.devDependencies,
			...this.pkg.peerDependencies,
		}
		if (allDeps.react || allDeps['react-dom'] || allDeps.next) return 'react'
		if (allDeps.lit || allDeps['lit-element'] || allDeps['lit-html']) return 'lit'
		return 'node'
	}

	/**
	 * Deeply updates/merges a top-level key in package.json
	 * @param {string} key
	 * @param {any | ((currentValue: any) => any)} updaterOrValue
	 * @returns {this}
	 */
	updatePackage(key, updaterOrValue) {
		const current = this.pkg[key]
		if (typeof updaterOrValue === 'function') {
			this.pkg[key] = updaterOrValue(current)
		} else if (
			typeof updaterOrValue === 'object' &&
			updaterOrValue !== null &&
			!Array.isArray(updaterOrValue)
		) {
			this.pkg[key] = { ...(current || {}), ...updaterOrValue }
		} else {
			this.pkg[key] = updaterOrValue
		}
		this._dirty = true
		return this
	}

	/**
	 * Replaces a nested value by dot-notation path (e.g. 'engines.node')
	 * @param {string} jsonPath
	 * @param {any | ((val: any) => any)} valueOrUpdater
	 * @returns {this}
	 */
	replaceValue(jsonPath, valueOrUpdater) {
		const parts = jsonPath.split('.')
		let cur = this.pkg
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i]
			if (cur[part] === undefined || cur[part] === null) {
				cur[part] = {}
			}
			cur = cur[part]
		}
		const lastKey = parts[parts.length - 1]
		const currentVal = cur[lastKey]
		cur[lastKey] =
			typeof valueOrUpdater === 'function' ? valueOrUpdater(currentVal) : valueOrUpdater
		this._dirty = true
		return this
	}

	/**
	 * Merges top-level patch object into package.json
	 * @param {Record<string, any>} patch
	 * @returns {this}
	 */
	setPackage(patch) {
		Object.assign(this.pkg, patch)
		this._dirty = true
		return this
	}

	/**
	 * Deletes a nested key by dot-notation path
	 * @param {string} jsonPath
	 * @returns {this}
	 */
	deleteKey(jsonPath) {
		const parts = jsonPath.split('.')
		let cur = this.pkg
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i]
			if (cur[part] === undefined || cur[part] === null) return this
			cur = cur[part]
		}
		const lastKey = parts[parts.length - 1]
		delete cur[lastKey]
		this._dirty = true
		return this
	}

	/**
	 * Saves modified package.json back via injected DB
	 * @returns {Promise<void>}
	 */
	async save() {
		if (!this._dirty || !this.db) return
		const pkgPath = this.db.resolveSync(this.dir, 'package.json')
		await this.db.saveDocument(pkgPath, this.pkg)
		this._dirty = false
	}
}
