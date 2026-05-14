/**
 * @typedef {(message: string, vars?: Record<string, any>) => string} TFunction
 * @description Translation function. Takes a message key and optional variables for substitution.
 * @param {string} message - The message key or template (e.g. "Hello {name}").
 * @param {Record<string, any>} [vars] - Object with variables to substitute into the template.
 * @returns {string} Localized string.
 */
/**
 * Creates a translation function bound to a specific vocabulary.
 * Supports ICU-like simple variable replacement ({name}) and plural/ordinal suffixes.
 *
 * @param {Object<string, string> | Map<string, string>} [vocab={}] - Mapping from keys to localized strings.
 * @param {string} [locale='en'] - The locale used for plural rules.
 * @returns {TFunction} Translation function.
 *
 * @example
 * ```js
 * const t = createT({ "Hello {name}": "{name}, вітаю!" }, "uk-UA")
 * t("Hello {name}", { name: "Іван" }) // → "Іван, вітаю!"
 * ```
 */
export function createT(vocab?: {
    [x: string]: string;
} | Map<string, string>, locale?: string): TFunction;
export type TFunction = (message: string, vars?: Record<string, any>) => string;
