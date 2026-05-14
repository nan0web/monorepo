/**
 * Parses string into argv array.
 * @param {string} str
 * @returns {string[]} Parsed argv
 */
export function str2argv(str) {
	// Handle quoted strings properly using more robust parsing
	const parts = []
	let i = 0
	str = String(str).trim()

	while (i < str.length) {
		// Skip whitespace
		while (i < str.length && str[i] === ' ') i++
		if (i >= str.length) break

		// Check for quotes
		if (str[i] === '"' || str[i] === "'") {
			const quote = str[i]
			i++
			let start = i
			while (i < str.length && str[i] !== quote) i++
			if (i < str.length) {
				parts.push(str.slice(start, i))
				i++
			} else {
				throw new Error(`Unmatched quote in argument: ${str}`)
			}
		} else {
			// Regular argument
			let start = i
			while (i < str.length && str[i] !== ' ') i++
			parts.push(str.slice(start, i))
		}
	}
	return parts
}
