import { Model } from '@nan0web/types'
import Navigation from './Navigation.js'

/**
 * HeroModel — OLMUI Component Model
 * Represents the top presentation section of a page.
 */
export class HeroModel extends Model {
	static $id = '@nan0web/ui/HeroModel'

	static badge = {
		help: 'Top small badge text or icon',
		placeholder: 'v1.4.0 out now',
		default: '',
	}
	static title = {
		help: 'Hero heading',
		placeholder: 'Build Amazing Apps',
		default: '',
		required: true,
	}
	static subtitle = {
		help: 'Hero secondary text',
		placeholder: 'The open architecture for the next web.',
		default: '',
	}
	static code = {
		help: 'Code snippet or secondary markup',
		default: '',
	}
	static actions = {
		help: 'CTA buttons',
		type: 'Navigation[]',
		model: Navigation,
		default: [],
	}

	/**
	 * @param {Partial<HeroModel | Record<string, any>>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Top small badge text ior icon */ this.badge
		/** @type {string} Hero heading */ this.title
		/** @type {string} Hero secondary text */ this.subtitle
		/** @type {string} Code snippet or secondary markup */ this.code
		/** @type {Navigation[]} CTA buttons */ this.actions
	}
}
