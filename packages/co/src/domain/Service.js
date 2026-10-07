import Interaction from './Interaction.js'

/**
 * Service
 * 
 * An interaction that represents an offer or request.
 *
 * @class Service
 * @extends Interaction
 */
export default class Service extends Interaction {
	/** @type {string} */
	type = 'offer'
	/** @type {string} */
	currency = 'WILLNI'

	static type = { type: 'string', validate: (val) => ['offer', 'request'].includes(val) || 'Must be offer or request' }
	static currency = { type: 'string', default: 'WILLNI' }

	constructor(input = {}) {
		super(input)
		if (input.type !== undefined) this.type = input.type
		if (input.currency !== undefined) this.currency = input.currency
	}
}
