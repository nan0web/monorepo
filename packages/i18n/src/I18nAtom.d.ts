/**
 * @class I18nAtom
 * Represents a localized data container supporting any type of values (strings, arrays, objects).
 * Decouples localization logic from DB/UI frameworks.
 */
export declare class I18nAtom {
    translations: Record<string, any>;
    /**
     * @param {Object.<string, *>} [translations={}] e.g., { uk: "Ярослав", en: "Yaroslav" }
     */
    constructor(translations?: Record<string, any>);
    /**
     * Resolve value for the given locale.
     * Falls back to "en", then to the first available translation, or undefined.
     * @param {string} [locale='uk']
     * @returns {*}
     */
    get(locale?: string): any;
    /**
     * Returns the string representation of the resolved value for default/uk locale.
     * @returns {string}
     */
    toString(): string;
    /**
     * Custom JSON serialization for database DB-FS storage.
     * @returns {Object.<string, *>}
     */
    toJSON(): Record<string, any>;
}
