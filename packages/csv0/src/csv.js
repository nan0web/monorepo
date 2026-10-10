/**
 * Pure CSV helpers — single source of truth for tabular (de)serialisation in the monorepo.
 * No I/O, no dependencies.
 */

/**
 * Decodes a raw CSV cell into a number when it looks numeric, otherwise returns trimmed text.
 * @param {any} value
 * @returns {any}
 */
export function decodeValue(value) {
	const text = `${value}`.trim()
	if (text === '') return text
	if (!isNaN(parseFloat(text)) && isFinite(Number(text))) return Number(text)
	return text
}

/**
 * Same as {@link decodeValue}, but also decodes `true` / `false` literals.
 * @param {any} value
 * @returns {any}
 */
export function decodeValueWithBooleans(value) {
	const text = `${value}`.trim()
	if (text === 'true') return true
	if (text === 'false') return false
	return decodeValue(text)
}

/**
 * Parses CSV content into a 2D array.
 * @param {string} content
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {(value: string) => any} [decode] Cell decoder, numbers by default.
 * @returns {any[][]}
 */
export function parseCSV(content, delimiter = ',', quote = '"', decode = decodeValue) {
	const rows = []
	let currentRow = []
	let currentValue = ''
	let inQuotes = false

	for (let i = 0; i < content.length; i++) {
		const char = content[i]
		if (char === quote) {
			if (inQuotes && content[i + 1] === quote) {
				currentValue += quote
				i++
			} else {
				inQuotes = !inQuotes
			}
		} else if (char === delimiter && !inQuotes) {
			currentRow.push(decode(currentValue))
			currentValue = ''
		} else if ((char === '\n' || (char === '\r' && content[i + 1] === '\n')) && !inQuotes) {
			if (char === '\r' && content[i + 1] === '\n') i++
			currentRow.push(decode(currentValue))
			rows.push(currentRow)
			currentRow = []
			currentValue = ''
		} else {
			currentValue += char
		}
	}

	if (currentValue || content.endsWith('\n') || content.endsWith('\r')) {
		currentRow.push(decode(currentValue))
	}
	if (currentRow.length > 0) rows.push(currentRow)
	return rows
}

/**
 * Converts a 2D array (first row = header) into an array of objects.
 * @param {any[][]} table
 * @returns {Array<Record<string, any>>}
 */
export function tableToObjects(table) {
	if (!table.length) return []
	const cols = table[0]
	return table.slice(1).map((row) => {
		/** @type {Record<string, any>} */
		const result = {}
		row.forEach((value, i) => (result[cols[i]] = value))
		return result
	})
}

/**
 * Parses CSV content straight into an array of objects.
 * @param {string} content
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {(value: string) => any} [decode]
 * @returns {Array<Record<string, any>>}
 */
export function parseCSVObjects(content, delimiter = ',', quote = '"', decode = decodeValue) {
	return tableToObjects(parseCSV(content, delimiter, quote, decode))
}

/**
 * Stringifies an array of objects into CSV (header from the first row keys).
 * A string input is returned as is.
 * @param {any} rows
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {string} [eol]
 * @returns {string}
 */
export function stringifyCSV(rows, delimiter = ',', quote = '"', eol = '\n') {
	if (typeof rows === 'string') return rows
	const escapeCell = (/** @type {any} */ cell) => {
		if (
			typeof cell === 'string' &&
			(cell.includes(delimiter) || cell.includes(quote) || cell.includes(eol))
		) {
			return `${quote}${cell.split(quote).join(quote + quote)}${quote}`
		}
		return String(cell ?? '')
	}
	if (!Array.isArray(rows) || rows.length === 0) return ''
	const cols = Object.keys(rows[0] || {})
	const csv = [cols.map(escapeCell).join(delimiter)]
	for (const row of rows) {
		csv.push(cols.map((k) => escapeCell(row?.[k])).join(delimiter))
	}
	return csv.join(eol)
}
