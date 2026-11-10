import { Model } from '@nan0web/types'
import Contact from './Contact.js'

/**
 * Identity
 * 
 * Decentralized Identity manifest (who am I: person, org, or site).
 * Extends standard Model.
 *
 * @class Identity
 * @extends Model
 */
export default class Identity extends Model {
	static id = { type: 'string', help: 'Unique subject identifier (DID or slug)' }
	static did = { type: 'string', help: 'Alias to id (Decentralized Identifier)' }
	static type = {
		type: 'string',
		help: 'Subject type',
		default: 'person',
		validate: (val) => ['person', 'org', 'site'].includes(val) || 'Type must be person, org, or site',
	}
	static title = {
		type: 'string',
		help: 'Subject title / name',
		default: '',
		validate: (v) => !v || typeof v === 'string' || 'Title must be a string',
	}
	static name = {
		type: 'string',
		help: 'Alias to title',
		default: '',
	}
	static role = { type: 'string', help: 'Position / slogan / occupation', default: '' }
	static declaration = { type: 'string', help: 'Manifesto, bio, or mission (Markdown)', default: '' }
	static avatar = { type: 'string', help: 'Media ID reference to avatar', default: '' }
	static public_keys = { type: 'array', help: 'Public keys', default: [] }
	static wallets = { type: 'array', help: 'Crypto/Fiat wallets', default: [] }
	static endpoints = { type: 'array', help: 'Contact endpoints (parsed to Contact[])', default: [] }
	static credentials = { type: 'object', help: 'Additional credentials/licenses', default: {} }

	/**
	 * @param {Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		const raw = { ...data }
		if (raw.id === undefined && raw.did !== undefined) {
			raw.id = raw.did
		}
		if (raw.did === undefined && raw.id !== undefined) {
			raw.did = raw.id
		}
		if (raw.title === undefined && raw.name !== undefined) {
			raw.title = raw.name
		}
		if (raw.name === undefined && raw.title !== undefined) {
			raw.name = raw.title
		}

		super(raw, options)

		/** @type {string} Unique subject identifier (DID or slug) */ this.id = this.id || this.did || ''
		/** @type {string} Alias to id (Decentralized Identifier) */ this.did = this.did || this.id || ''
		/** @type {'person' | 'org' | 'site'} Subject type */ this.type = this.type || 'person'
		/** @type {string} Subject title / name */ this.title = this.title || this.name || ''
		/** @type {string} Alias to title */ this.name = this.name || this.title || ''
		/** @type {string} Position / slogan / occupation */ this.role = this.role || ''
		/** @type {string} Manifesto, bio, or mission (Markdown) */ this.declaration = this.declaration || ''
		/** @type {string} Media ID reference to avatar */ this.avatar = this.avatar || ''
		/** @type {string[]} Public keys */ this.public_keys = Array.isArray(this.public_keys) ? this.public_keys : []
		/** @type {string[]} Crypto/Fiat wallets */ this.wallets = Array.isArray(this.wallets) ? this.wallets : []
		/** @type {Record<string, any>} Additional credentials/licenses */ this.credentials = typeof this.credentials === 'object' && this.credentials !== null ? this.credentials : {}

		if (Array.isArray(this.endpoints)) {
			/** @type {Contact[]} Contact endpoints (parsed to Contact[]) */ this.endpoints = this.endpoints.map((c) => Contact.from(c))
		} else {
			/** @type {Contact[]} Contact endpoints (parsed to Contact[]) */ this.endpoints = []
		}
	}

	/**
	 * @type {Contact[]}
	 */
	get contacts() {
		return this.endpoints
	}
}
