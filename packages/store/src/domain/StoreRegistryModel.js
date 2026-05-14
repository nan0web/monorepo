import { Model } from '@nan0web/types'

/**
 * StoreRegistryModel — Схема одиничного запису в Глобальному Реєстрі.
 * Відповідає стандарту Model-as-Schema v2.
 */
export class StoreRegistryModel extends Model {
	static UI = {
		labelName: 'Package Name',
		labelPath: 'Workspace Path',
		labelVersion: 'Version',
		errorInvalidVersion: 'Invalid semver format',
	}

	static appName = {
		alias: 'name',
		type: 'string',
		required: true,
	}

	static workspace = {
		type: 'string',
		options: ['apps', 'packages', 'data'],
		default: 'packages',
	}

	static relPath = {
		alias: 'path',
		type: 'string',
		required: true,
	}

	static tags = {
		type: 'string',
		default: '',
	}

	static version = {
		type: 'string',
		default: '1.0.0',
		validate: (v) => /^\d+\.\d+\.\d+/.test(v) || StoreRegistryModel.UI.errorInvalidVersion,
	}

	static description = {
		type: 'string',
		default: '',
	}

	/**
	 * @param {Partial<StoreRegistryModel> | Record<string, any>} [data] Initial state
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.appName
		/** @type {string} */ this.workspace
		/** @type {string} */ this.relPath
		/** @type {string} */ this.tags
		/** @type {string} */ this.version
		/** @type {string} */ this.description
	}
}

export default StoreRegistryModel
