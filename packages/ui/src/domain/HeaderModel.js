import { Model } from '@nan0web/types'
import Navigation from './Navigation.js'

/**
 * HeaderModel — OLMUI Component Model
 * Universal header structure with logo, navigation, and language controls.
 */
export class HeaderModel extends Model {
	static $id = '@nan0web/ui/HeaderModel'

	static title = {
		help: 'Header title text',
		placeholder: 'My Site',
		default: '',
	}
	static logo = {
		help: 'Primary logo path',
		placeholder: 'logo.svg',
		default: '',
	}
	static logoDark = {
		help: 'Dark theme logo path',
		placeholder: 'logo-dark.svg',
		default: '',
	}
	static nav = {
		help: 'Main navigation links',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}
	static actions = {
		help: 'CTA or specific header actions',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}
	static share = {
		help: 'Social sharing or utility links',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}
	static lang = {
		help: 'Active language code or object',
		default: null,
	}
	static langs = {
		help: 'Available languages',
		default: [],
	}

	/**
	 * @param {Partial<HeaderModel>} data
	 */
	constructor(data = {}) {
		super(data)
		/** @type {string} */ this.title
		/** @type {string} */ this.logo
		/** @type {string} */ this.logoDark
		/** @type {Navigation[]} */ 
		this.nav = this.#map(this.nav)
		/** @type {Navigation[]} */
		this.actions = this.#map(this.actions)
		/** @type {Navigation[]} */
		this.share = this.#map(this.share)
		/** @type {any} */
		this.lang = this.lang
		/** @type {any[]} */
		this.langs = Array.isArray(this.langs) ? this.langs : []
	}

	#map(arr) {
		return Array.isArray(arr) ? arr.map(i => i instanceof Navigation ? i : new Navigation(i)) : []
	}
}
