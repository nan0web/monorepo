import { ModelError } from '@nan0web/types'

import { AuditorDiscovery } from '../Discovery.js'
import { AuditorModel } from '../../AuditorModel.js'

/**
 * JS-specific auditor discovery via package.json dependencies.
 */
export class JsAuditorDiscovery extends AuditorDiscovery {
	/**
	 * @returns {{AuditorModel: typeof AuditorModel}}
	 */
	importAuditorModel() {
		return { AuditorModel }
	}

	/**
	 * Discovers target project by targetDir and imports the
	 * `package.json#exports.inspect` that exports AuditorModels, if provided.
	 *
	 * @throws {ModelError}
	 * @param {string} targetDir
	 * @returns {Promise<Set<typeof AuditorModel>>}
	 */
	async discover(targetDir) {
		/** @type {Set<typeof AuditorModel>} */
		const discoveredAuditors = new Set()
		const db = this._.db
		if (!db) return discoveredAuditors

		const failed = []
		const pkgPath = db.resolveSync(targetDir, 'package.json')
		
		/** @type {string[]} List of potential entry points for local inspectors */
		const localEntries = [
			'inspect.js',
			'.inspect/index.js',
			'.inspect.js'
		]

		try {
			const pkg = await db.loadDocument(pkgPath).catch(() => null)
			
			// 1. Check target project's own 'inspect' export from package.json
			if (pkg?.exports?.['./inspect']) {
				localEntries.unshift(pkg.exports['./inspect'])
			}

			// 2. Scan and import local entries
			for (const entry of localEntries) {
				const fullPath = db.resolveSync(targetDir, entry)
				if (await db.statDocument(fullPath).then(s => s.exists && s.isFile).catch(() => false)) {
					try {
						const mod = await this.importModule(fullPath)
						this.collectAuditors(mod, discoveredAuditors)
					} catch (err) {
						failed.push(new ModelError({ local: fullPath, err }))
					}
				}
			}

			// 3. Scan dependencies starting with @nan0web/
			if (pkg) {
				const deps = Object.keys({
					...(pkg.dependencies || {}),
					...(pkg.devDependencies || {})
				}).filter(dep => dep.startsWith('@nan0web/'))

				for (const dep of deps) {
					const depPkgPath = db.resolveSync(targetDir, 'node_modules', dep, 'package.json')
					try {
						const depPkg = await db.loadDocument(depPkgPath).catch(() => null)
						if (depPkg?.exports?.['./inspect']) {
							const mod = await this.importModule(`${dep}/inspect`)
							this.collectAuditors(mod, discoveredAuditors)
						}
					} catch (err) {
						failed.push(new ModelError({ dependency: depPkgPath, err }))
					}
				}
			}
		} catch (err) {
			failed.push(new ModelError({ package: pkgPath, err }))
		}
		if (failed.length) {
			const error = failed.reduce((prev, current) => {
				prev.fields.errors.push(current)
				return prev
			}, new ModelError({ errors: [] }))
			throw error
		}

		return discoveredAuditors
	}
}
