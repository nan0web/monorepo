import { Model } from '@nan0web/types'
import Contact from './Contact.js'

/**
 * Identity
 * 
 * Decentralized Identity manifest (who am I).
 * Extends standard Model.
 *
 * @class Identity
 * @extends Model
 */
export default class Identity extends Model {
	/** @type {string} */
	did = ''
	/** @type {string[]} */
	public_keys = []
	/** @type {string} */
	name = ''
	/** @type {string} */
	declaration = ''
	/** @type {string[]} */
	wallets = []
	/** @type {Contact[]} */
	endpoints = []

	static did = { type: 'string', help: 'Decentralized Identifier' }
	static public_keys = { type: 'array', default: [] }
	static name = { type: 'string', validate: (v) => !!v || 'Name is required' }
	static declaration = { type: 'string', help: 'Declaration of Will' }
	static wallets = { type: 'array', help: 'Crypto/Fiat wallets', default: [] }
	static endpoints = { type: 'array', help: 'Matrix / Inbox URLs', default: [] }

	constructor(data = {}, options = {}) {
		super(data, options)
		if (Array.isArray(this.endpoints)) {
			this.endpoints = this.endpoints.map((c) => Contact.from(c))
		}
	}
}
