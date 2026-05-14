import { Model } from '@nan0web/types'

/**
 * Base class for auditor discovery.
 * Specific platforms (JS, Python) should extend this class.
 */
export class AuditorDiscovery extends Model {
	/**
	 * @param {Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * Discovers auditors in the given directory.
	 * @param {string} targetDir
	 * @returns {Promise<Set<any>>}
	 */
	async discover(targetDir) {
		return new Set()
	}
	
	/**
	 * Dynamic importer for auditors.
	 * @param {string} specifier
	 * @returns {Promise<any>}
	 */
	async importModule(specifier) {
		return await import(specifier)
	}

	/**
	 * Collects auditor classes from a module.
	 * @param {any} mod Module or object containing exports.
	 * @param {Set<typeof import('../AuditorModel.js').AuditorModel>} discoveredAuditors Set to add discovered auditors to.
	 */
	collectAuditors(mod, discoveredAuditors) {
		const { AuditorModel } = this.importAuditorModel()
		for (const key in mod) {
			const ExportedItem = mod[key]
			if (typeof ExportedItem === 'function' && ExportedItem.prototype instanceof AuditorModel) {
				discoveredAuditors.add(ExportedItem)
			}
		}
	}

	/**
	 * Lazy-load AuditorModel to avoid circular dependencies.
	 * @returns {{AuditorModel: typeof import('../AuditorModel.js').AuditorModel}}
	 */
	importAuditorModel() {
		// This should be overridden or imported carefully.
		// For now we assume the caller knows.
		return /** @type {any} */ ({}) 
	}
}
