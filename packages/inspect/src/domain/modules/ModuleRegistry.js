import { ModuleItem } from './ModuleItem.js'

/**
 * ModuleRegistry represents a collection of inspected modules across workspace zones.
 * Provides Fluent API for batch mutations, querying, and index generation (CSV0 and Markdown).
 */
export class ModuleRegistry {
	/**
	 * @param {object} options
	 * @param {ModuleItem[]} options.items
	 * @param {import('@nan0web/db').DB} [options.db]
	 * @param {string[]} [options.zones]
	 */
	constructor({ items = [], db = null, zones = ['packages', 'apps', 'apps/3rdparty'] }) {
		this.items = items
		this.db = db
		this.zones = zones
	}

	/**
	 * Asynchronously discovers and loads modules from the specified zones via injected DB.
	 * @param {object} options
	 * @param {import('@nan0web/db').DB} options.db
	 * @param {string[]} [options.zones]
	 * @returns {Promise<ModuleRegistry>}
	 */
	static async create({ db, zones = ['packages', 'apps', 'apps/3rdparty'] }) {
		const items = []
		for (const zone of zones) {
			try {
				for await (const entry of db.readDir(zone, { depth: 0, includeDirs: true })) {
					if (!entry.isDirectory) continue
					let dir = entry.path || `${zone}/${entry.name}`
					if (dir.endsWith('/')) dir = dir.slice(0, -1)
					const pkgPath = db.resolveSync(dir, 'package.json')
					const pkg = await db.loadDocument(pkgPath).catch(() => null)
					if (pkg && typeof pkg === 'object') {
						const tsconfigPath = db.resolveSync(dir, 'tsconfig.json')
						const tsconfig = (await db.loadDocument(tsconfigPath).catch(() => ({}))) || {}
						items.push(new ModuleItem({ dir, pkg, tsconfig, db }))
					}
				}
			} catch {
				// Zone directory might not exist in db, continue
			}
		}
		return new ModuleRegistry({ items, db, zones })
	}

	/**
	 * Returns items matching a given zone prefix.
	 * More specific zones (like apps/3rdparty) take precedence over parent zones (apps).
	 * @param {string} zone
	 * @returns {ModuleItem[]}
	 */
	byZone(zone) {
		const cleanZone = zone.endsWith('/') ? zone.slice(0, -1) : zone
		// Find other zones configured in this registry that are subpaths of cleanZone or vice-versa
		const otherDeeperZones = this.zones
			.map((z) => (z.endsWith('/') ? z.slice(0, -1) : z))
			.filter((z) => z !== cleanZone && z.startsWith(cleanZone + '/'))

		return this.items.filter((item) => {
			const dir = item.dir.endsWith('/') ? item.dir.slice(0, -1) : item.dir
			if (!dir.startsWith(cleanZone + '/')) return false
			// If this item belongs to a deeper zone registered, it shouldn't belong to the parent zone
			for (const deeper of otherDeeperZones) {
				if (dir.startsWith(deeper + '/')) return false
			}
			return true
		})
	}

	/**
	 * Filters modules and returns a new ModuleRegistry instance (Fluent chaining).
	 * @param {(module: ModuleItem) => boolean} predicate
	 * @returns {ModuleRegistry}
	 */
	filter(predicate) {
		const filtered = this.items.filter(predicate)
		return new ModuleRegistry({
			items: filtered,
			db: this.db,
			zones: this.zones,
		})
	}

	/**
	 * Finds the first matching module.
	 * @param {(module: ModuleItem) => boolean} predicate
	 * @returns {ModuleItem | undefined}
	 */
	find(predicate) {
		return this.items.find(predicate)
	}

	/**
	 * @returns {Iterator<ModuleItem>}
	 */
	[Symbol.iterator]() {
		return this.items[Symbol.iterator]()
	}

	/**
	 * Deeply updates/merges a key in package.json for all matched modules.
	 * @param {string} key
	 * @param {any | ((currentValue: any) => any)} updaterOrValue
	 * @returns {this}
	 */
	updatePackage(key, updaterOrValue) {
		for (const item of this.items) {
			item.updatePackage(key, updaterOrValue)
		}
		return this
	}

	/**
	 * Replaces a nested value by dot-notation path in all matched modules.
	 * @param {string} jsonPath
	 * @param {any | ((val: any) => any)} valueOrUpdater
	 * @returns {this}
	 */
	replaceValue(jsonPath, valueOrUpdater) {
		for (const item of this.items) {
			item.replaceValue(jsonPath, valueOrUpdater)
		}
		return this
	}

	/**
	 * Sets top-level package properties for all matched modules.
	 * @param {Record<string, any>} patch
	 * @returns {this}
	 */
	setPackage(patch) {
		for (const item of this.items) {
			item.setPackage(patch)
		}
		return this
	}

	/**
	 * Deletes a nested key in all matched modules.
	 * @param {string} jsonPath
	 * @returns {this}
	 */
	deleteKey(jsonPath) {
		for (const item of this.items) {
			item.deleteKey(jsonPath)
		}
		return this
	}

	/**
	 * Saves all dirty modules back to DB.
	 * @returns {Promise<void>}
	 */
	async save() {
		for (const item of this.items) {
			await item.save()
		}
	}

	/**
	 * Serializes modules in the given zone (or all) to CSV string.
	 * @param {string} [zone]
	 * @returns {string}
	 */
	toCsv(zone) {
		const targetItems = zone ? this.byZone(zone) : this.items
		const lines = ['name,dir,version,ui,profile,private']
		for (const m of targetItems) {
			const ui = m.ui.join(';')
			lines.push(`${m.name},${m.dir},${m.version},${ui},${m.profile},${m.private}`)
		}
		return lines.join('\n')
	}

	/**
	 * Serializes modules in the given zone (or all) to CSV0 string with FrontMatter and 0/1 boolean representation.
	 * @param {string} [zone]
	 * @returns {string}
	 */
	toCsv0(zone) {
		const targetItems = zone ? this.byZone(zone) : this.items
		const lines = [
			'---',
			'columns:',
			'  private: boolean',
			'  version: @nan0web/version',
			'---',
			'name,dir,version,ui,profile,private',
		]
		for (const m of targetItems) {
			const ui = m.ui.join(';')
			const priv = m.private ? '1' : '0'
			lines.push(`${m.name},${m.dir},${m.version},${ui},${m.profile},${priv}`)
		}
		return lines.join('\n')
	}

	/**
	 * Generates a structured Markdown table index for a zone.
	 * @param {string} zone
	 * @returns {string}
	 */
	toMarkdown(zone) {
		const targetItems = zone ? this.byZone(zone) : this.items
		const title = zone ? `${zone.charAt(0).toUpperCase() + zone.slice(1)} Index` : 'Modules Index'
		const lines = [
			`# ${title}`,
			'',
			'| Name | Directory | Version | UI | Profile | Private |',
			'| :--- | :--- | :--- | :--- | :--- | :--- |',
		]
		for (const m of targetItems) {
			const ui = m.ui.join(', ') || '—'
			const priv = m.private ? 'yes' : 'no'
			lines.push(
				`| \`${m.name}\` | \`${m.dir}\` | \`${m.version}\` | \`${ui}\` | \`${m.profile}\` | ${priv} |`
			)
		}
		lines.push('')
		return lines.join('\n')
	}

	/**
	 * Generates and writes modules.csv and index.md for all configured zones.
	 * @returns {Promise<void>}
	 */
	async writeIndexes() {
		if (!this.db) return
		for (const zone of this.zones) {
			const mdContent = this.toMarkdown(zone)
			const csvContent = this.toCsv0(zone)

			const mdPath = this.db.resolveSync(zone, 'index.md')
			const csvPath = this.db.resolveSync(zone, 'modules.csv')

			await this.db.saveDocument(mdPath, mdContent)
			await this.db.saveDocument(csvPath, csvContent)
		}
	}
}
