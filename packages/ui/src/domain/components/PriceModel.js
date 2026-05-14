import { Model } from '@nan0web/types'

/**
 * PriceModel — OLMUI Model-as-Schema
 * Represents a monetary value with currency.
 */
export class PriceModel extends Model {
	static $id = '@nan0web/ui/PriceModel'

	static value = {
		help: 'Numeric price value',
		default: 0,
		type: 'number',
	}
	static currency = {
		help: 'Currency code (ISO 4217)',
		placeholder: 'USD',
		default: 'USD',
	}

	/**
	 * @param {Partial<PriceModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} Numeric price value */ this.value
		/** @type {string} Currency code (ISO 4217) */ this.currency
	}
}
