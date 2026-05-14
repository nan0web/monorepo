import { Model } from '@nan0web/types'

/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA' | string} Locale */

/**
 * @property {string} title Language title
 * @property {Locale} locale Locale
 * @property {string} icon Language icon
 */
export class Language extends Model {
	static title = {
		help: 'Language title',
		default: '',
	}
	static locale = {
		help: 'Locale',
		errorNotFound: 'Locale not found',
		errorInvalidFormat: 'Invalid locale format',
		/** @type {Locale} */
		default: 'en_GB',
		validate: (/** @type {string} */ str) => /^[a-z]{2}(_[A-Z]{2})?$/.test(str) || Language.locale.errorInvalidFormat,
	}
	static icon = {
		help: 'Language icon',
		default: '🇬🇧',
	}
	/**
	 * @param {Partial<Language> | Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {string} Language title */ this.title
		/** @type {Locale} */ this.locale
		/** @type {string} Language icon */ this.icon
	}
}
