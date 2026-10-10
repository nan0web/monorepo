import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import fsp from 'node:fs/promises'
import { parseCSV, parseCSVObjects, stringifyCSV } from '@nan0web/csv0'

/**
 * Loads and parses CSV file into array of objects.
 */
function loadCSV(filePath, delimiter = ',', quote = '"', softError = false) {
	if (!existsSync(filePath)) {
		if (softError) return []
		throw new Error(`File not found: ${filePath}`)
	}
	try {
		const content = readFileSync(filePath, { encoding: 'utf-8' })
		return parseToObjects(content, delimiter, quote)
	} catch (err) {
		if (softError) return []
		throw err
	}
}

/**
 * Loads and parses CSV file asynchronously.
 */
async function loadCSVAsync(filePath, delimiter = ',', quote = '"', softError = false) {
	try {
		const content = await fsp.readFile(filePath, 'utf-8')
		return parseToObjects(content, delimiter, quote)
	} catch (err) {
		if (softError) return []
		throw err
	}
}

function parseToObjects(content, delimiter = ',', quote = '"') {
	return parseCSVObjects(content, delimiter, quote)
}

/**
 * Saves data as CSV file.
 */
function saveCSV(filePath, data, delimiter = ',', quote = '"', eol = '\n') {
	const text = stringifyCSV(data, delimiter, quote, eol)
	writeFileSync(filePath, text, 'utf8')
	return text
}

/**
 * Saves data as CSV file asynchronously.
 */
async function saveCSVAsync(filePath, data, delimiter = ',', quote = '"', eol = '\n') {
	const text = stringifyCSV(data, delimiter, quote, eol)
	await fsp.writeFile(filePath, text, 'utf8')
	return text
}

// stringifyCSV is provided by @nan0web/csv0 (single source of truth)

export { loadCSV, saveCSV, parseCSV, loadCSVAsync, saveCSVAsync, parseToObjects, stringifyCSV }
