import { Model } from '@nan0web/types'
import { PricingModel } from './PricingModel.js'

/**
 * PricingSectionModel — OLMUI Model-as-Schema
 * A section containing a title and a collection of pricing tiers.
 */
export class PricingSectionModel extends Model {
	static $id = '@nan0web/ui/PricingSectionModel'

	static title = {
		help: 'Section title',
		placeholder: 'Pricing Plans',
		default: '',
	}
	static items = {
		help: 'Array of pricing tiers',
		type: 'PricingModel[]',
		hint: PricingModel,
		default: [],
	}

	/**
	 * @param {Partial<PricingSectionModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Section title */ this.title
		/** @type {PricingModel[]} Array of pricing tiers */ this.items
	}
}
