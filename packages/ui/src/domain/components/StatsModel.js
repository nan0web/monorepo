import { Model } from '@nan0web/types'
import { StatsItemModel } from './StatsItemModel.js'

/**
 * StatsModel — OLMUI Model-as-Schema
 * A collection of stat items for dashboards and overview sections.
 */
export class StatsModel extends Model {
	static $id = '@nan0web/ui/StatsModel'

	static title = {
		help: 'Stats section title',
		placeholder: 'Key Metrics',
		default: '',
	}
	static items = {
		help: 'Array of stat entries',
		type: 'StatsItemModel[]',
		hint: StatsItemModel,
		default: [],
	}

	/**
	 * @param {Partial<StatsModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Stats section title */ this.title
		/** @type {StatsItemModel[]} Array of stat entries */ this.items
	}
}
