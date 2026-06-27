/**
 * @typedef {Object} ParseResult
 * @property {boolean} isValid
 * @property {string=} error
 * @property {Array<import("../domain/app/ChatSessionModel.js").Attachment>} files
 */
/**
 * StrictBoundaryInterpreter - parses assistant output in strict boundary format
 * and checks for illegal markdown code blocks.
 */
export class StrictBoundaryInterpreter {
	/**
	 * Parse response content
	 * @param {string} source
	 * @returns {ParseResult}
	 */
	static parse(source) {
		const sanitized = String(source)
			.replace(/\r/g, '')
			.replace(/---boundary------boundary/g, '---boundary---\n---boundary')
			.replace(/(?<!\n|^)(---boundary)/g, '\n$1')
			.replace(/(---boundary(?::[^-\s\n]+)?---)(?!\n|$)/g, '$1\n')
		const lines = sanitized.split('\n')
		const files = []
		let currentFile = null
		let hasOutsideMarkdown = false
		const autoCountFiles = new Set()

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]

			// Match boundary opening: ---boundary:filename--- or ---boundary:filename:startLine:lineCount---
			const match = line.match(/^---boundary:([^:\s]+)(?::(\d+):(\d+))?---$/)

			if (match) {
				const path = match[1]

				if (currentFile) {
					files.push(currentFile)
					if (path === currentFile.filename) {
						currentFile = null
						continue
					}
				}

				currentFile = {
					filename: path,
					content: '',
					startLine: match[2] ? parseInt(match[2], 10) : undefined,
					lineCount: match[3] ? parseInt(match[3], 10) : undefined,
				}
				if (!match[3]) autoCountFiles.add(currentFile)
			} else if (line.trim() === '---boundary---' || line.trim() === '---boundary') {
				if (currentFile) {
					files.push(currentFile)
					currentFile = null
				}
			} else {
				if (currentFile) {
					currentFile.content += line + '\n'
				} else {
					// Outside boundary blocks, check for markdown code blocks
					if (line.trim().startsWith('```')) {
						hasOutsideMarkdown = true
					}
				}
			}
		}

		if (currentFile) {
			files.push(currentFile)
		}

		// Cleanup file contents trailing newlines
		for (const f of files) {
			f.content = f.content.trimEnd()
		}

		if (hasOutsideMarkdown || (files.length === 0 && String(source).includes('```'))) {
			return {
				isValid: false,
				error: 'markdown_not_allowed_use_boundary',
				files: [],
			}
		}

		return {
			isValid: true,
			files,
		}
	}
}
