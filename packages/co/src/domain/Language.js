/**
 * Language class for handling localization data.
 *
 * Stores language information including name, icon, ISO code, and locale.
 *
 * @class Language
 */
export default class Language {
	/** @type {string} */
	name = ''

	/** @type {string} */
	icon = ''

	/** @type {string} */
	code = ''

	/** @type {string} */
	locale = ''

	/**
	 * Create a new Language instance.
	 *
	 * @param {object} [input={}]
	 * @param {string} [input.name=""] - Human‑readable language name.
	 * @param {string} [input.icon=""] - Emoji or icon representing the language.
	 * @param {string} [input.code=""] - ISO 639‑1 language code (e.g. "en", "uk").
	 * @param {string} [input.locale=""] - Locale identifier (e.g. "en-US", "uk-UA").
	 */
	constructor(input = {}) {
		const { name = this.name, icon = this.icon, code = this.code, locale = this.locale } = input
		this.name = String(name)
		this.icon = String(icon)
		this.code = String(code)
		this.locale = String(locale)
	}

	/**
	 * Convert language to a human‑readable string.
	 *
	 * @returns {string} Concatenation of name and icon.
	 */
	toString() {
		return [this.name, this.icon].filter(Boolean).join(' ')
	}

	/**
	 * Factory method to create a Language instance.
	 *
	 * @param {any} input - Language instance or plain data.
	 * @returns {Language}
	 */
	static from(input) {
		if (input instanceof Language) return input
		return new Language(input)
	}
}
