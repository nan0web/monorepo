import { Model } from '@nan0web/types'

/**
 * TimelineItemModel — OLMUI Model-as-Schema
 * A single entry on a timeline (event, milestone, changelog).
 */
export class TimelineItemModel extends Model {
	static $id = '@nan0web/ui/TimelineItemModel'

	static date = {
		help: 'Date of the event (ISO 8601 or display string)',
		placeholder: '2026-01-15',
		default: '',
		required: true,
	}
	static title = {
		help: 'Event or milestone title',
		placeholder: 'Product Launch',
		default: '',
		required: true,
	}
	static description = {
		help: 'Detailed description of the event',
		placeholder: 'We launched our new product...',
		default: '',
	}

	/**
	 * @param {Partial<TimelineItemModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Date of the event */ this.date
		/** @type {string} Event or milestone title */ this.title
		/** @type {string} Detailed description of the event */ this.description
	}
}
