import { Model } from '@nan0web/types'

/**
 * SecretItemModel - Single secret credential or note item in the vault.
 */
export class SecretItemModel extends Model {
	static id = {
		help: 'Unique secret identifier',
		required: true,
	}

	static title = {
		help: 'Human-readable title or label',
		default: '',
	}

	static username = {
		help: 'Account login or username',
		default: '',
	}

	static password = {
		help: 'Secret password or token',
		default: '',
	}

	static secret = {
		help: 'Raw secret or private key payload',
		default: '',
	}

	static notes = {
		help: 'Optional private notes',
		default: '',
	}

	/**
	 * @param {Partial<SecretItemModel>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.id
		/** @type {string} */ this.title
		/** @type {string} */ this.username
		/** @type {string} */ this.password
		/** @type {string} */ this.secret
		/** @type {string} */ this.notes
	}
}
