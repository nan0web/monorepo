import { Model } from '@nan0web/types'
import { Content } from './Content.js'
import Navigation from './Navigation.js'
import { Language } from '@nan0web/i18n'

export class Document extends Model {
	static title = { type: 'string', help: 'Title' }
	static content = { type: 'array', model: Content, help: 'Content' }
	static $content = { type: 'array', model: Content, help: 'Layout configuration' }
	static nav = { type: 'any', model: Navigation, help: 'Navigation config or reference' }
	static langs = { type: 'array', model: Language, help: 'Supported languages array' }
	/**
	 *
	 * @param {Partial<Document>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Title */ this.title
		/** @type {Array<Content>} Content */ this.content
		/** @type {Array<Content>} Layout configuration */ this.$content
		/** @type {Navigation|string|Array<Navigation>} Navigation config */ this.nav
		/** @type {Array<Language>} Supported languages */ this.langs
	}
}
