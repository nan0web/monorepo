import { Model } from '@nan0web/types'

/**
 * FooterVisibilityModel — OLMUI Model-as-Schema
 * Boolean flags controlling which footer elements are visible.
 */
export class FooterVisibilityModel extends Model {
	static $id = '@nan0web/ui/FooterVisibilityModel'

	static copyright = {
		help: 'Show copyright text',
		default: true,
		type: 'boolean',
	}
	static version = {
		help: 'Show version string',
		default: true,
		type: 'boolean',
	}
	static license = {
		help: 'Show license info',
		default: false,
		type: 'boolean',
	}
	static nav = {
		help: 'Show footer navigation',
		default: true,
		type: 'boolean',
	}
	static clock = {
		help: 'Show clock widget',
		default: false,
		type: 'boolean',
	}

	/**
	 * @param {Partial<FooterVisibilityModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Show copyright text */ this.copyright
		/** @type {boolean} Show version string */ this.version
		/** @type {boolean} Show license info */ this.license
		/** @type {boolean} Show footer navigation */ this.nav
		/** @type {boolean} Show clock widget */ this.clock
	}
}
