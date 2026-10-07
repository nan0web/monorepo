/**
 * Language class for handling localization data.
 *
 * Stores language information including name, icon, ISO code, and locale.
 *
 * @class Language
 */
export default class Language {
    /**
     * Factory method to create a Language instance.
     *
     * @param {any} input - Language instance or plain data.
     * @returns {Language}
     */
    static from(input: any): Language;
    /**
     * Create a new Language instance.
     *
     * @param {object} [input={}]
     * @param {string} [input.name=""] - Human‑readable language name.
     * @param {string} [input.icon=""] - Emoji or icon representing the language.
     * @param {string} [input.code=""] - ISO 639‑1 language code (e.g. "en", "uk").
     * @param {string} [input.locale=""] - Locale identifier (e.g. "en-US", "uk-UA").
     */
    constructor(input?: {
        name?: string | undefined;
        icon?: string | undefined;
        code?: string | undefined;
        locale?: string | undefined;
    });
    /** @type {string} */
    name: string;
    /** @type {string} */
    icon: string;
    /** @type {string} */
    code: string;
    /** @type {string} */
    locale: string;
    /**
     * Convert language to a human‑readable string.
     *
     * @returns {string} Concatenation of name and icon.
     */
    toString(): string;
}
