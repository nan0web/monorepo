/**
 * Escapes HTML entities in a string.
 * @param {string|number|boolean|bigint} unsafe - The value to escape.
 * @param {Array<string>} [ignore=[]] - Characters to ignore during escaping.
 * @returns {string} - The escaped string.
 */
function escape(unsafe, ignore = []) {
	if (!['string', 'number', 'bigint', 'boolean'].includes(typeof unsafe)) {
		return String(unsafe)
	}
	let result = '' + unsafe
	if (!ignore.includes('&')) result = result.replace(/&/g, '&amp;')
	if (!ignore.includes('<')) result = result.replace(/</g, '&lt;')
	if (!ignore.includes('>')) result = result.replace(/>/g, '&gt;')
	if (!ignore.includes('"')) result = result.replace(/"/g, '&quot;')
	if (!ignore.includes("'")) result = result.replace(/'/g, '&#039;')
	return result
}

export default escape
