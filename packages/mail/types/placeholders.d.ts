/**
 * Replace placeholders like {{key}} in a string with corresponding values from a data object.
 * @param {string} template - The string containing placeholders (e.g., {{key}}).
 * @param {object} data - The flattened data object containing key-value pairs.
 * @param {Function} escaper - The escape value function;
 * @returns {string} - The string with replaced placeholders.
 */
export function replace(template: string, data: object, escaper?: Function): string;
