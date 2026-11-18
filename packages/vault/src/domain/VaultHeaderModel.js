import { Model } from '@nan0web/types'

/**
 * VaultHeaderModel - Metadata header for vault container validation.
 */
export class VaultHeaderModel extends Model {
	static magic = {
		help: 'Magic signature bytes',
		default: 'NAN0VAULT',
	}

	static version = {
		help: 'Container schema version',
		default: 1,
	}

	static createdAt = {
		help: 'Container creation timestamp',
		default: () => new Date().toISOString(),
	}

	static updatedAt = {
		help: 'Last update timestamp',
		default: () => new Date().toISOString(),
	}

	/**
	 * @param {Partial<VaultHeaderModel>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.magic
		/** @type {number} */ this.version
		/** @type {string} */ this.createdAt
		/** @type {string} */ this.updatedAt
	}
}
