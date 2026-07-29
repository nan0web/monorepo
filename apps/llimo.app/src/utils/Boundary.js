import { FileProtocol, FileEntry } from "../FileProtocol.js"

/**
 * BoundaryProtocol – parses custom boundary blocks like ---boundary:path---
 */
export class BoundaryProtocol extends FileProtocol {
	/**
	 * Parse the source into ParsedFile.
	 * @param {string} source - a source of content
	 * @returns {Promise<import("../FileProtocol.js").ParsedFile>}
	 */
	static async parse(source) {
		/** @type {FileEntry[]} */
		const correct = []
		/** @type {import("../FileProtocol.js").FileError[]} */
		const failed = []

		let currentEntry = null
		let currentPath = null
		const lines = String(source).split("\n")

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			const lineNum = i + 1

			// Match ---boundary:path--- or ---boundary:path:lineStart:linesCount---
			// Path is allowed to contain alphanumeric, slash, dot, underscore, dash, @, etc.
			const match = line.match(/^---boundary:([^:\s]+)(?::(\d+):(\d+))?---$/)

			if (match) {
				const path = match[1]

				if (currentEntry) {
					correct.push(currentEntry)
					if (path === currentPath) {
						currentEntry = null
						currentPath = null
						continue
					}
				}

				currentPath = path
				currentEntry = new FileEntry({
					label: path,
					filename: path,
					content: "",
					startLine: match[2] ? parseInt(match[2], 10) : undefined,
					lineCount: match[3] ? parseInt(match[3], 10) : undefined,
				})
			} else if (line.trim() === "---boundary---" || line.trim() === "---boundary") {
				if (currentEntry) {
					correct.push(currentEntry)
					currentEntry = null
					currentPath = null
				}
			} else {
				if (currentEntry) {
					currentEntry.content += line + "\n"
				}
			}
		}

		if (currentEntry) {
			correct.push(currentEntry)
		}



		const { isValid, validate, files, requested } = FileProtocol.validate(correct)
		return { correct, failed, isValid, validate, files, requested }
	}
}
