/**
 * Replace placeholders like {{key}} in a string with corresponding values from a data object.
 * @param {string} template - The string containing placeholders (e.g., {{key}}).
 * @param {object} data - The flattened data object containing key-value pairs.
 * @param {Function} escaper - The escape value function;
 * @returns {string} - The string with replaced placeholders.
 */
export function replace(template, data, escaper = (v) => v) {
	if ('string' !== typeof template) return template
	return template.replace(/{{(.*?)}}/g, (match, key) => {
		const value = data[key.trim()]
		return value !== undefined ? escaper(value) : match // Keep the placeholder if key is not found
	})
}
