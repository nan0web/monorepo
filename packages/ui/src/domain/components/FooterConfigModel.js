import { Model } from '@nan0web/types'
import { FooterVisibilityModel } from './FooterVisibilityModel.js'

/**
 * FooterConfigModel — OLMUI Model-as-Schema
 * Configuration container mapping UI variant keys to FooterVisibilityModel instances.
 */
export class FooterConfigModel extends Model {
	static $id = '@nan0web/ui/FooterConfigModel'

	static ui = {
		help: 'Map of UI variant name → FooterVisibilityModel',
		type: 'Record<string, FooterVisibilityModel>',
		hint: FooterVisibilityModel,
		default: {},
	}

	/**
	 * @param {Partial<FooterConfigModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Record<string, FooterVisibilityModel>} Map of UI variant name → FooterVisibilityModel */ this.ui
	}
}
