import path from 'node:path'

import { result } from '@nan0web/ui'
import { Command } from './Command.js'

export class LsCommand extends Command {
	static alias = 'ls'
	static mightGroup = true
	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { db } = this.chat._
		const lines = this.content
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
		let resultText = `### Command: ${LsCommand.alias}\n\n`

		for (const dirPath of lines) {
			resultText += `#### Directory: ${dirPath}\n`
			if (dirPath.startsWith('@')) {
				// DB path
				try {
					const entries = []
					if (db) {
						for await (const entry of db.readDir(dirPath)) {
							const entryAny = /** @type {any} */ (entry)
							if (entry && (entryAny.uri || entry.path || entry.name)) {
								entries.push(entryAny.uri || entry.path || entry.name)
							}
						}
					}
					resultText +=
						entries.length > 0 ? entries.map((e) => `- ${e}`).join('\n') : 'Empty directory\n'
				} catch (e) {
					resultText += `Error listing DB directory: ${/** @type {any} */ (e).message}\n`
				}
			} else {
				// Local directory or glob
				try {
					if (dirPath.includes('*') || dirPath.includes('?') || dirPath.includes('{')) {
						const matches = []
						if (db && typeof db.browse === 'function') {
							const mm = (await import('micromatch')).default
							let baseDir = '.'
							let pattern = dirPath
							if (dirPath.startsWith('@workflows/')) {
								pattern = `@data/uk/workflows/${dirPath.substring(11)}`
							}

							const firstWildcard = pattern.search(/[\*\?\{]/)
							if (firstWildcard !== -1) {
								const lastSlash = pattern.lastIndexOf('/', firstWildcard)
								if (lastSlash !== -1) {
									baseDir = pattern.substring(0, lastSlash)
								}
							}

							const ignoreList = pattern.startsWith('@')
								? []
								: ['.git', 'node_modules', 'dist', '.datasets', 'chat', 'releases']

							for await (const entry of db.browse(baseDir, { depth: -1, ignore: ignoreList })) {
								const entryPath = entry.path || entry.name
								if (mm.isMatch(entryPath, pattern)) {
									matches.push(entryPath)
								} else {
									const absPath = path.resolve(db.cwd || '.', entryPath)
									if (mm.isMatch(absPath, pattern)) {
										matches.push(absPath)
									}
								}
							}
						} else {
							try {
								/** @todo switch from micromatch & node:fs to this.chat.db.browse */
								const mm = (await import('micromatch')).default
								const { readdir } = await import('node:fs/promises')
								const globPattern = dirPath.replace(/\\/g, '/')
								let baseDir = '.'
								const firstWildcard = globPattern.search(/[\*\?\{]/)
								if (firstWildcard !== -1) {
									const lastSlash = globPattern.lastIndexOf('/', firstWildcard)
									if (lastSlash !== -1) {
										baseDir = globPattern.substring(0, lastSlash)
									}
								}

								const walk = async (dir) => {
									const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
									for (const entry of entries) {
										const fullPath = path.join(dir, entry.name).replace(/\\/g, '/')
										if (entry.isDirectory()) {
											if (entry.name !== 'node_modules' && entry.name !== '.git') {
												await walk(fullPath)
											}
										} else {
											if (mm.isMatch(fullPath, globPattern)) {
												matches.push(fullPath)
											}
										}
									}
								}
								await walk(baseDir)
							} catch (e) {}
						}
						resultText +=
							matches.length > 0 ? matches.map((m) => `- ${m}`).join('\n') : 'No matching files\n'
					} else {
						const { readdir } = await import('node:fs/promises')
						const entries = await readdir(dirPath, { withFileTypes: true })
						const formatted = entries.map((e) => `- ${e.name}${e.isDirectory() ? '/' : ''}`)
						resultText += formatted.length > 0 ? formatted.join('\n') : 'Empty directory\n'
					}
				} catch (e) {
					resultText += `Error listing directory: ${/** @type {any} */ (e).message}\n`
				}
			}
			resultText += '\n\n'
		}

		return result(resultText)
	}
}
