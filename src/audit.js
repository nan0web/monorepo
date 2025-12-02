import AuditIssue from "./AuditIssue.js"

/**
 * Parse a single audit block (the part between the top and bottom border).
 *
 * @param {string} str
 * @returns {AuditIssue}
 */
export function parseAuditBlock(str) {
	const map = {
		Package: "pkg",
		"Vulnerable versions": "vulnerable",
		"Patched versions": "patched",
		Paths: "paths",
		"More info": "info",
	}
	const result = new AuditIssue()
	let currentKey = ""

	for (const row of str.split("\n")) {
		const parts = row.split("│")
		if (parts.length < 3) continue
		const key = parts[1].trim()
		const val = parts[2].trim()

		if (key) {
			currentKey = key
			const lc = key.toLowerCase()
			if (["critical", "high", "moderate", "low"].includes(lc)) {
				result.type = lc
				result.text = val
			} else if (map[key]) {
				result[map[key]] = val
			}
		} else if (currentKey) {
			if (result.type && result.text !== undefined) {
				result.text += " " + val
			} else if (map[currentKey]) {
				const prop = map[currentKey]
				result[prop] = `${result[prop] ?? ""} ${val}`.trim()
			}
		}
	}
	if (result.text) result.text = result.text.trim()
	return result
}

/**
 * Parse the whole audit output – potentially many blocks.
 *
 * @param {string} text
 * @returns {AuditIssue[]}
 */
export function parseAuditResult(text) {
	const rows = text.split("\n")
	const items = []

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i].trim()
		if (!row.startsWith("┌")) continue
		const endIdx = i + rows.slice(i).findIndex(r => r.trim().startsWith("└"))
		if (endIdx === -1) break
		const inner = rows.slice(i + 1, endIdx).join("\n")
		const parsed = parseAuditBlock(inner)
		if (parsed.type) items.push(parsed)
		i = endIdx
	}
	return items
}
