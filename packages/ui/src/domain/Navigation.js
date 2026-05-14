import { Model } from '@nan0web/types'

/**
 * Navigation Model — OLMUI Model-as-Schema
 * Generic recursive navigation structure for all UI platforms (CLI, Web, Mobile).
 */
export default class Navigation extends Model {
	static $id = '@nan0web/ui/Navigation'

	static title = {
		help: 'Label for the menu item',
		placeholder: 'Home',
		default: '',
		required: true,
	}
	static href = {
		help: 'URL or internal app route',
		placeholder: '/',
		default: '#',
	}
	static icon = {
		help: 'Icon name/ID',
		placeholder: 'home',
		default: '',
	}
	static image = {
		help: 'Display image or thumbnail',
		placeholder: 'https://...',
		default: '',
	}
	static children = {
		help: 'Nested sub-menu navigation',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}
	static hidden = {
		help: 'Hide from lists/menus',
		type: 'boolean',
		default: false,
	}

	/**
	 * @param {Partial<Navigation> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Label for the menu item */ this.title
		/** @type {string} URL or internal app route */ this.href
		/** @type {string} Icon name/ID */ this.icon
		/** @type {string} Display image or thumbnail */ this.image
		/** @type {Navigation[]} Nested sub-menu navigation */ this.children
		/** @type {boolean} Hide from lists/menus */ this.hidden

		if (this.children) {
			this.children = this.children.map((item) => new Navigation(item))
		}
	}
}
