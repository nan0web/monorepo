/**
 * Unescapes XML entities in a string.
 * Inverse of escape().
 * @param {string} str - The string to unescape.
 * @returns {string} - The unescaped string.
 */
function unescape(str) {
	if (typeof str !== 'string') return String(str)
	return str
		.replace(/&#039;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&amp;/g, '&')
}

export default unescape
