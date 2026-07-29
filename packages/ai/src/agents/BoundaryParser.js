/**
 * Parses a string containing OLMUI boundary markers into a structured file map.
 * This implementation uses manual offset/string analysis for performance,
 * avoiding Regular Expressions for large content streams.
 *
 * Format:
 * ---boundary:path/to/file.js---
 * ... content ...
 * ---boundary---
 *
 * Snippet Format (experimental):
 * ---boundary:path/to/file.js:33:3---
 * ... new 3-line replacement ...
 * ---boundary---
 *
 * @param {string} text The raw text received from the LLM or external agent.
 * @throws {Error} If a boundary is not closed or snippet constraints are violated.
 * @returns {Record<string, string>} Hash map of updated file contents.
 */
export function parseBoundaries(text) {
	/** @type {Record<string, string>} Hash map of file paths to their string contents. */
	const files = {}
	const markerStart = '---boundary:'
	const markerEnd = '---boundary---'

	let offset = 0

	while (offset < text.length) {
		const startIdx = text.indexOf(markerStart, offset)
		if (startIdx === -1) break

		// Find end of the header line
		const headerEndIdx = text.indexOf('---', startIdx + markerStart.length)
		if (headerEndIdx === -1) {
			throw new Error('Boundary header not closed with "---"')
		}

		const header = text.slice(startIdx + markerStart.length, headerEndIdx)
		// Header might be "path/to/file.js" or "path/to/file.js:startLine:lineCount"
		const parts = header.split(':')
		const filePath = parts[0].trim()

		// Content starts after the header line's trailing dashes and potential newline
		let contentStartIdx = headerEndIdx + 3 // skip '---'
		if (text[contentStartIdx] === '\r') contentStartIdx++
		if (text[contentStartIdx] === '\n') contentStartIdx++

		// Find the closing boundary
		const contentEndIdx = text.indexOf(markerEnd, contentStartIdx)
		if (contentEndIdx === -1) {
			throw new Error(`Boundary for "${filePath}" not closed with "${markerEnd}"`)
		}

		let content = text.slice(contentStartIdx, contentEndIdx)

		// Trim potential trailing newline before boundary
		if (content.endsWith('\n')) content = content.slice(0, -1)
		if (content.endsWith('\r')) content = content.slice(0, -1)

		// Snippet validation (per user request)
		if (parts.length === 3) {
			const startLine = parseInt(parts[1])
			const lineCount = parseInt(parts[2])
			const actualCount = content.split('\n').length

			// User specifically requested error if 3 lines replaced with 1 etc.
			if (actualCount !== lineCount) {
				throw new Error(
					`Snippet for "${filePath}" expects ${lineCount} lines, but got ${actualCount}`
				)
			}
			files[header] = content
		} else {
			files[filePath] = content
		}

		// Move offset past the closing boundary
		offset = contentEndIdx + markerEnd.length
	}

	return files
}

/**
 * Applies parsed boundaries (full files or line-range snippets) to a set of original files.
 *
 * @param {Record<string, string>} originalFiles Map of original file paths to their contents.
 * @param {Record<string, string>} parsedBoundaries Map of parsed boundary keys to their contents.
 * @throws {Error} If snippet boundaries fall out of bounds of the original file.
 * @returns {Record<string, string>} Map of updated file contents.
 */
export function applyBoundaries(originalFiles, parsedBoundaries) {
	const result = { ...originalFiles }

	for (const [key, content] of Object.entries(parsedBoundaries)) {
		const parts = key.split(':')
		const filePath = parts[0].trim()

		if (parts.length === 3) {
			const startLine = parseInt(parts[1])
			const lineCount = parseInt(parts[2])

			const originalContent = result[filePath] ?? ''
			const lines = originalContent ? originalContent.split('\n') : []

			if (startLine < 1 || startLine > lines.length + 1) {
				throw new Error(
					`Invalid startLine ${startLine} for file "${filePath}" with ${lines.length} lines`
				)
			}

			lines.splice(startLine - 1, lineCount, ...content.split('\n'))
			result[filePath] = lines.join('\n')
		} else {
			result[filePath] = content
		}
	}

	return result
}
