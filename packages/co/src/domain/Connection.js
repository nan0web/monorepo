import { Model } from '@nan0web/types'

/**
 * Connection
 * 
 * Defines the relationship (role/context/navigation/taxonomy) between entities.
 * Extends standard Model.
 *
 * @class Connection
 * @extends Model
 */
export default class Connection extends Model {
	static id = { type: 'string', help: 'Unique slug or identifier' }
	static title = { type: 'string', help: 'Connection title', default: '' }
	static context = {
		type: 'string',
		help: 'Context type',
		default: 'navigation',
		validate: (val) => ['navigation', 'category', 'relation'].includes(val) || 'Context must be navigation, category, or relation',
	}
	static role = {
		type: 'string',
		help: 'Role in context',
		default: 'header',
		validate: (val) => ['header', 'footer', 'topic', 'partner'].includes(val) || true,
	}
	static target_did = { type: 'string', help: 'DID or ID of target/parent entity', default: '' }
	static items = { type: 'array', help: 'Hierarchical navigation items ({ title, href, items })', default: [] }
	static attributes = { type: 'object', default: {}, help: 'Context-specific data' }

	/**
	 * @param {Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Unique identifier */ this.id = this.id || ''
		/** @type {string} Connection title */ this.title = this.title || ''
		/** @type {'navigation' | 'category' | 'relation'} Context type */ this.context = this.context || 'navigation'
		/** @type {'header' | 'footer' | 'topic' | 'partner' | string} Role */ this.role = this.role || 'header'
		/** @type {string} Target DID or ID */ this.target_did = this.target_did || ''
		/** @type {Array<Record<string, any>>} Hierarchical navigation items */ this.items = Array.isArray(this.items) ? this.items : []
		/** @type {Record<string, any>} Context-specific attributes */ this.attributes = typeof this.attributes === 'object' && this.attributes !== null ? this.attributes : {}
	}
}
