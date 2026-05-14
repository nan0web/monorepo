import { Model } from '@nan0web/types'
import { TimelineItemModel } from './TimelineItemModel.js'

/**
 * TimelineModel — OLMUI Model-as-Schema
 * A collection of timeline events (changelog, roadmap, history).
 */
export class TimelineModel extends Model {
	static $id = '@nan0web/ui/TimelineModel'

	static title = {
		help: 'Timeline section title',
		placeholder: 'Our Journey',
		default: '',
	}
	static items = {
		help: 'Array of timeline events',
		type: 'TimelineItemModel[]',
		hint: TimelineItemModel,
		default: [],
	}

	/**
	 * @param {Partial<TimelineModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Timeline section title */ this.title
		/** @type {TimelineItemModel[]} Array of timeline events */ this.items
	}
}
