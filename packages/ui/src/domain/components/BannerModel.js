import { Model } from '@nan0web/types'

/**
 * BannerModel — OLMUI Model-as-Schema
 * Global notification bar (cookies, maintenance, announcements).
 */
export class BannerModel extends Model {
	static $id = '@nan0web/ui/BannerModel'

	static text = {
		help: 'Banner message text',
		placeholder: 'We use cookies to improve your experience',
		default: '',
		required: true,
	}
	static href = {
		help: 'Optional link for "Learn more" or action URL',
		placeholder: 'https://...',
		default: '',
	}
	static closable = {
		help: 'Whether the user can dismiss the banner',
		default: true,
		type: 'boolean',
	}

	/**
	 * @param {Partial<BannerModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Banner message text */ this.text
		/** @type {string} Optional link for "Learn more" or action URL */ this.href
		/** @type {boolean} Whether the user can dismiss the banner */ this.closable
	}
}
