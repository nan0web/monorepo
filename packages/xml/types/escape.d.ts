export default escape;
/**
 * Escapes HTML entities in a string.
 * @param {string|number|boolean|bigint} unsafe - The value to escape.
 * @param {Array<string>} [ignore=[]] - Characters to ignore during escaping.
 * @returns {string} - The escaped string.
 */
declare function escape(unsafe: string | number | boolean | bigint, ignore?: Array<string>): string;
