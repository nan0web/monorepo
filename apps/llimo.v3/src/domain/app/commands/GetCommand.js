import { result } from '@nan0web/ui'
import { Command } from './Command.js'

export class GetCommand extends Command {
	static alias = 'get'
	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { db, os } = this.chat._
		const lines = this.content
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
		let resultText = `### Command: ${GetCommand.alias}\n\n`

		for (const pattern of lines) {
			resultText += `#### Get: ${pattern}\n`
			if (pattern.startsWith('@')) {
				// DB path
				try {
					if (db) {
						const doc = await db.loadDocumentAs('.txt', pattern, '')
						if (typeof doc === 'string') {
							resultText += `\`\`\`\n${doc}\n\`\`\`\n`
						} else {
							resultText += 'Not found or not a text file\n'
						}
					}
				} catch (e) {
					resultText += `Error reading DB file: ${/** @type {any} */ (e).message}\n`
				}
			} else {
				// Local path/glob
				try {
					const resolved = await this.chat.resolvePaths(pattern)
					if (resolved.length > 0) {
						if (resolved.length > 5) {
							resultText += `Too many files matched the pattern "${pattern}" (${resolved.length} files). To avoid prompt context overflow, please specify files explicitly.\n`
						} else {
							for (const { path } of resolved) {
								if (await os.exists(path)) {
									const doc = await os.readFile(path)
									const ext = path.split('.').pop() || 'txt'
									resultText += `File: ${path}\n\`\`\`${ext}\n${doc}\n\`\`\`\n`
								} else {
									resultText += `File not found: ${path}\n`
								}
							}
						}
					} else {
						resultText += `No files matched pattern: ${pattern}\n`
					}
				} catch (e) {
					resultText += `Error reading files: ${/** @type {any} */ (e).message}\n`
				}
			}
			resultText += '\n'
		}

		return result(resultText)
	}
}
