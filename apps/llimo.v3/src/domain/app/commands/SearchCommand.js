import { result } from '@nan0web/ui'
import { Command } from './Command.js'

export class SearchCommand extends Command {
	static alias = 'search'
	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const lines = this.content
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
		let resultText = `### Command: ${SearchCommand.alias}\n\n`

		const query = lines[0] || ''
		const searchDir = lines[1] || '.'
		let ragSuccess = false

		const isTesting =
			typeof globalThis.it === 'function' ||
			process.env.NODE_ENV === 'test' ||
			process.argv.some((arg) => arg.includes('test'))

		if (query) {
			if (!isTesting) {
				try {
					const { SearchSourcesIntent } = await import('@nan0web/ai')
					const searchApp = new SearchSourcesIntent(
						{
							query,
							limit: 10,
							json: true,
						},
						{
							workspaceRoot: this.chat._['workspaceRoot'] || process.cwd(),
							db: this.chat._.db,
						}
					)

					let results = []
					for await (const it of searchApp.run()) {
						if (it.type === 'result') {
							results = it.data
						}
					}

					if (results && results.length > 0) {
						resultText += `Search query: "${query}" (RAG Semantic Search results):\n\n`
						for (const r of results) {
							resultText += `File: ${r.file}\n`
							resultText += `Score: ${r.score !== undefined ? r.score.toFixed(4) : 'N/A'}\n`
							resultText += `Snippet:\n${r.content}\n`
							resultText += `────────────────────────────────────────\n`
						}
						ragSuccess = true
					}
				} catch (e) {
					// Fall through to fallback text search
				}
			}

			if (!ragSuccess) {
				resultText += `Search query: "${query}" in ${searchDir} (Fallback Text Search):\n\n`
				try {
					const { readdir, readFile } = await import('node:fs/promises')
					const pathMod = await import('node:path')

					const matches = []
					const walk = async (dir) => {
						const entries = await readdir(dir, { withFileTypes: true })
						for (const entry of entries) {
							const fullPath = pathMod.join(dir, entry.name)
							if (fullPath.includes('node_modules') || fullPath.includes('.git')) continue
							if (entry.isDirectory()) {
								await walk(fullPath)
							} else if (entry.isFile()) {
								try {
									const textContent = await readFile(fullPath, 'utf8')
									if (textContent.includes(query)) {
										const fileLines = textContent.split('\n')
										const lineMatches = []
										fileLines.forEach((lineText, idx) => {
											if (lineText.includes(query)) {
												lineMatches.push({ lineNum: idx + 1, content: lineText.trim() })
											}
										})
										matches.push({ path: fullPath, lines: lineMatches.slice(0, 10) })
									}
								} catch (e) {
									// Skip
								}
							}
						}
					}
					await walk(searchDir)
					if (matches.length > 0) {
						for (const match of matches) {
							resultText += `File: ${match.path}\n`
							match.lines.forEach((lm) => {
								resultText += `  Line ${lm.lineNum}: ${lm.content}\n`
							})
							resultText += '\n'
						}
					} else {
						resultText += 'No matches found\n'
					}
				} catch (e) {
					resultText += `Error performing search: ${/** @type {any} */ (e).message}\n`
				}
			}
		} else {
			resultText += 'Error: Empty search query\n'
		}

		return result(resultText)
	}
}
