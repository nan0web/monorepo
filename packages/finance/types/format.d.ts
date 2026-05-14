/**
 * Formats a number using Intl.NumberFormat.
 * @param {number} amount - The numeric value to format.
 * @param {string} [currency] - Optional currency code (e.g., 'UAH', 'USD').
 * @param {string} [locale='uk-UA'] - Locale identifier.
 * @param {Object} [options] - Additional formatting options.
 * @param {number} [options.decimals] - Number of decimal places.
 * @returns {string}
 */
export function formatNumber(amount: number, currency?: string, locale?: string, options?: {
    decimals?: number | undefined;
}): string;
/**
 * Formats an amount which can be a number, an array (range), or an object {min, max}.
 * @param {number|number[]|Object} value - Value to format.
 * @param {string} [currency] - Optional currency code.
 * @param {string} [locale='uk-UA'] - Locale identifier.
 * @param {Object} [options]
 * @returns {string}
 */
export function formatAmount(value: number | number[] | Object, currency?: string, locale?: string, options?: Object): string;
/**
 * Formats a rate which can be a number or an object {minRate, maxRate}.
 * @param {number|Object} value - Rate value.
 * @param {string} [locale='uk-UA'] - Locale identifier.
 * @returns {string}
 */
export function formatRate(value: number | Object, locale?: string): string;
/**
 * Formats a range using a custom divider and formatter.
 * @param {Object} range - Range object {min, max}.
 * @param {string} [divider=' — '] - Divider string.
 * @param {Function} [formatter=formatAmount] - Formatter function.
 * @param {string} [currency]
 * @returns {string|null}
 */
export function formatRange(range: Object, divider?: string, formatter?: Function, currency?: string): string | null;
