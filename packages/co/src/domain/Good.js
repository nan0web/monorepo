import Interaction from './Interaction.js'

/**
 * Good
 * 
 * Ontology of value proposal (product, service, tariff, program).
 * Represents anything that can be offered, contracted, or subscribed to.
 *
 * @class Good
 * @extends Interaction
 */
export default class Good extends Interaction {
	static id = { type: 'string', help: 'Unique slug of product or service' }
	static type = {
		type: 'string',
		help: 'Value type',
		default: 'product',
		validate: (val) => ['product', 'service', 'tariff', 'program'].includes(val) || 'Type must be product, service, tariff, or program',
	}
	static title = { type: 'string', help: 'Title or name of the good', default: '' }
	static excerpt = { type: 'string', help: 'Short value proposition', default: '' }
	static body = { type: 'string', help: 'Full description (Markdown)', default: '' }
	static currency = { type: 'string', help: 'Currency code (e.g. EUR, UAH, USD)', default: 'EUR' }
	static price = { type: 'object', help: 'Price or pricing conditions/rules', default: {} }
	static features = { type: 'array', help: 'List of features/benefits', default: [] }
	static documents = { type: 'array', help: 'Array of PDF or contract links', default: [] }

	/**
	 * @param {Record<string, any>} [input]
	 */
	constructor(input = {}) {
		super(input)
		const raw = typeof input === 'string' ? { body: input } : { ...input }

		/** @type {string} */
		this.id = raw.id !== undefined ? String(raw.id) : ''
		/** @type {'product' | 'service' | 'tariff' | 'program'} */
		this.type = raw.type !== undefined ? raw.type : 'product'
		/** @type {string} */
		this.title = raw.title !== undefined ? String(raw.title) : ''
		/** @type {string} */
		this.excerpt = raw.excerpt !== undefined ? String(raw.excerpt) : ''
		/** @type {string} */
		this.currency = raw.currency !== undefined ? String(raw.currency) : 'EUR'
		/** @type {number | Record<string, any>} */
		this.price = raw.price !== undefined ? (typeof raw.price === 'number' ? { amount: raw.price } : raw.price) : {}
		/** @type {string[]} */
		this.features = Array.isArray(raw.features) ? raw.features : []
		/** @type {string[]} */
		this.documents = Array.isArray(raw.documents) ? raw.documents : []
	}

	/**
	 * @type {number}
	 */
	get amount() {
		if (typeof this.price === 'number') return this.price
		if (typeof this.price === 'object' && this.price !== null && typeof this.price.amount === 'number') {
			return this.price.amount
		}
		return 0
	}
}
