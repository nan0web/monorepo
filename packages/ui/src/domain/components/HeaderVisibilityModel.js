import { Model } from '@nan0web/types'

/**
 * HeaderVisibilityModel — OLMUI Model-as-Schema
 * Boolean flags controlling which header elements are visible.
 */
export class HeaderVisibilityModel extends Model {
	static $id = '@nan0web/ui/HeaderVisibilityModel'

	static logo = {
		help: 'Show logo',
		default: true,
		type: 'boolean',
	}
	static theme = {
		help: 'Show theme toggle (dark/light)',
		default: true,
		type: 'boolean',
	}
	static search = {
		help: 'Show search input',
		default: false,
		type: 'boolean',
	}
	static share = {
		help: 'Show share button',
		default: false,
		type: 'boolean',
	}
	static nav = {
		help: 'Show navigation links',
		default: true,
		type: 'boolean',
	}
	static langs = {
		help: 'Show language switcher',
		default: true,
		type: 'boolean',
	}

	/**
	 * @param {Partial<HeaderVisibilityModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Show logo */ this.logo
		/** @type {boolean} Show theme toggle (dark/light) */ this.theme
		/** @type {boolean} Show search input */ this.search
		/** @type {boolean} Show share button */ this.share
		/** @type {boolean} Show navigation links */ this.nav
		/** @type {boolean} Show language switcher */ this.langs
	}
}
