/**
 * Pure JSONL (newline-delimited JSON) helpers.
 */

/**
 * Parses JSONL text into an array of values. Blank lines are skipped.
 * @param {string} text
 * @returns {any[]}
 */
export function parseJSONL(text) {
	return `${text ?? ''}`
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => JSON.parse(l))
}

/**
 * Stringifies a value (or array of values) into JSONL text.
 * @param {any} data
 * @returns {string}
 */
export function stringifyJSONL(data) {
	const arr = Array.isArray(data) ? data : [data]
	return arr.map((item) => JSON.stringify(item)).join('\n')
}
