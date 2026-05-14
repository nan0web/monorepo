import { Model } from '@nan0web/types'
import { Language } from '@nan0web/i18n'
import Navigation from './Navigation.js'

/**
 * FooterModel — OLMUI Component Model
 * Universal footer structure.
 */
export class FooterModel extends Model {
	static $id = '@nan0web/ui/FooterModel'

	static copyright = {
		help: 'Copyright notice text',
		placeholder: '© 2026 My Site',
		default: '',
	}
	static version = {
		help: 'App version to display',
		placeholder: '1.0.0',
		default: '',
	}
	static license = {
		help: 'License name or link',
		placeholder: 'ISC',
		default: '',
	}
	static nav = {
		help: 'Terms of Service, Privacy Policy, etc.',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}
	static share = {
		help: 'Social sharing links',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}
	static lang = {
		help: 'Active language',
		default: null,
	}
	static langs = {
		help: 'Languages for switcher',
		type: 'Language[]',
		hint: Language,
		default: [],
	}

	/**
	 * @param {Partial<FooterModel>} data
	 */
	constructor(data = {}) {
		super(data)
		/** @type {string} */ this.copyright
		/** @type {string} */ this.version
		/** @type {string} */ this.license
		/** @type {Navigation[]} */
		this.nav = this.#map(this.nav)
		/** @type {Navigation[]} */
		this.share = this.#map(this.share)
		/** @type {Language|null} */
		this.lang = this.lang && !(this.lang instanceof Language) ? new Language(this.lang) : this.lang
		/** @type {Language[]} */
		this.langs = Array.isArray(this.langs)
			? this.langs.map((l) => (l instanceof Language ? l : new Language(l)))
			: []
	}

	#map(arr) {
		return Array.isArray(arr)
			? arr.map((i) => (i instanceof Navigation ? i : new Navigation(i)))
			: []
	}
}
