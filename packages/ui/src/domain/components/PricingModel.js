import { Model } from '@nan0web/types'
import { PriceModel } from './PriceModel.js'

/**
 * PricingModel — OLMUI Model-as-Schema
 * A pricing tier/plan with title, price, and feature list.
 */
export class PricingModel extends Model {
	static $id = '@nan0web/ui/PricingModel'

	static title = {
		help: 'Pricing plan name',
		placeholder: 'Pro Plan',
		default: '',
		required: true,
	}
	static price = {
		help: 'Price object (value + currency)',
		type: 'PriceModel',
		hint: PriceModel,
		default: null,
	}
	static features = {
		help: 'List of features included in this plan',
		type: 'string[]',
		default: [],
	}

	/**
	 * @param {Partial<PricingModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Pricing plan name */ this.title
		/** @type {PriceModel|null} Price object (value + currency) */ this.price
		/** @type {string[]} List of features included in this plan */ this.features
	}
}
