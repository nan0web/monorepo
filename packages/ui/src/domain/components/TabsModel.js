import { Model } from '@nan0web/types'

/**
 * TabsModel — OLMUI Model-as-Schema
 * Tab container with selectable panels.
 */
export class TabsModel extends Model {
	static $id = '@nan0web/ui/TabsModel'

	static active = {
		help: 'Index of the currently active tab',
		default: 0,
		type: 'number',
	}
	static tabs = {
		help: 'Tab definitions (label + content pairs)',
		type: 'object[]',
		default: [],
	}

	/**
	 * @param {Partial<TabsModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} Index of the currently active tab */ this.active
		/** @type {Array<{label: string, content: string}>} Tab definitions */ this.tabs
	}
}
