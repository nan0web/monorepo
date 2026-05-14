import { Model } from '@nan0web/types'

/**
 * StatsItemModel — OLMUI Model-as-Schema
 * A single stat entry (e.g. "Users: 10,000 ↑12%").
 */
export class StatsItemModel extends Model {
	static $id = '@nan0web/ui/StatsItemModel'

	static label = {
		help: 'Stat label (e.g. "Active Users")',
		placeholder: 'Users',
		default: '',
		required: true,
	}
	static value = {
		help: 'Stat value (number or formatted string)',
		placeholder: '10,000',
		default: '',
		required: true,
	}
	static trend = {
		help: 'Trend indicator (e.g. "+12%", "-3%", or empty)',
		placeholder: '+12%',
		default: '',
	}

	/**
	 * @param {Partial<StatsItemModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Stat label (e.g. "Active Users") */ this.label
		/** @type {string} Stat value (number or formatted string) */ this.value
		/** @type {string} Trend indicator (e.g. "+12%", "-3%", or empty) */ this.trend
	}
}
