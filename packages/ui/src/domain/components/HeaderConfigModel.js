import { Model } from '@nan0web/types'
import { HeaderVisibilityModel } from './HeaderVisibilityModel.js'

/**
 * HeaderConfigModel — OLMUI Model-as-Schema
 * Configuration container mapping UI variant keys to HeaderVisibilityModel instances.
 */
export class HeaderConfigModel extends Model {
	static $id = '@nan0web/ui/HeaderConfigModel'

	static ui = {
		help: 'Map of UI variant name → HeaderVisibilityModel',
		type: 'Record<string, HeaderVisibilityModel>',
		hint: HeaderVisibilityModel,
		default: {},
	}

	/**
	 * @param {Partial<HeaderConfigModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Record<string, HeaderVisibilityModel>} Map of UI variant name → HeaderVisibilityModel */ this.ui
	}
}
