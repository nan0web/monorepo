import DB from '@nan0web/db'
import Markdown from '@nan0web/markdown'
import YAML from 'yaml'

/**
 * @typedef {{ filename: string, content: string, startLine?: number, lineCount?: number }} FileSegment
 *
 * @typedef {Object} DecodeResult
 * @property {boolean} isValid
 * @property {string} [error]
 * @property {Array<FileSegment>} files
 */

export class CommunicationProtocol {
	/**
	 * @param {DB} db
	 */
	constructor(db) {
		this.db = db
	}
	/**
	 * @param {string | Markdown} text
	 * @returns {Promise<string>}
	 */
	async encode(text) {
		return ''
	}

	/**
	 * @param {string} text
	 * @returns {DecodeResult}
	 */
	decode(text) {
		return {
			isValid: false,
			files: [],
		}
	}
}
export class BoundaryProtocol extends CommunicationProtocol {
	/**
	 * Validates file content based on extension.
	 * @param {string} filename
	 * @param {string} content
	 * @returns {{ valid: boolean, error?: string }}
	 */
	static validateFileContent(filename, content) {
		const ext = filename.split('.').pop()?.toLowerCase()
		try {
			if (ext === 'json') JSON.parse(content)
			if (ext === 'yaml' || ext === 'yml') YAML.parse(content)
			if (ext === 'jsonl') {
				content.split('\n').filter(Boolean).forEach(l => JSON.parse(l))
			}
			return { valid: true }
		} catch (e) {
			return { valid: false, error: /** @type {any} */ (e).message }
		}
	}

	/**
	 * @param {DB} db
	 * @param {string} [locale='uk']
	 */
	constructor(db, locale = 'uk') {
		super(db)
		this.locale = locale
	}

	/**
	 * Resolves a path, wildcard (e.g. src/** or src/*.js), or database/workflow path.
	 * @param {string} pathPattern
	 * @returns {Promise<Array<{ path: string, isDb: boolean }>>}
	 */
	async resolvePaths(pathPattern) {
		if (!pathPattern) return []

		// 1. Database logical paths/workflows
		if (pathPattern.startsWith('@data/') || pathPattern.startsWith('@workflows/')) {
			let dbPath = pathPattern
			if (pathPattern.startsWith('@workflows/')) {
				const name = pathPattern.substring(11)
				const targetPath = `@data/${this.locale}/workflows/${name}`
				try {
					const stat = await this.db.stat(targetPath)
					if (stat && stat.exists) {
						dbPath = targetPath
					} else {
						// Fallback to 'en'
						const fallbackPath = `@data/en/workflows/${name}`
						const fallbackStat = await this.db.stat(fallbackPath)
						if (fallbackStat && fallbackStat.exists) {
							dbPath = fallbackPath
						} else {
							dbPath = targetPath
						}
					}
				} catch (e) {
					dbPath = targetPath
				}
			}
			return [{ path: dbPath, isDb: true }]
		}

		// 2. Check if it's a directory or wildcard/glob pattern (contains * or ?)
		const hasWildcard = pathPattern.includes('*') || pathPattern.includes('?')
		let isDir = pathPattern.endsWith('/')
		if (!isDir && !hasWildcard) {
			try {
				const stat = await this.db.stat(pathPattern)
				if (stat && stat.isDirectory) {
					isDir = true
				}
			} catch (e) {}
		}

		if (hasWildcard || isDir) {
			let baseDir = pathPattern
			let filterPattern = null

			if (hasWildcard) {
				const firstWildcardIdx = pathPattern.search(/[*?]/)
				const lastSlashBeforeWildcard = pathPattern.lastIndexOf('/', firstWildcardIdx)
				if (lastSlashBeforeWildcard !== -1) {
					baseDir = pathPattern.substring(0, lastSlashBeforeWildcard)
					filterPattern = pathPattern.substring(lastSlashBeforeWildcard + 1)
				} else {
					baseDir = '.'
					filterPattern = pathPattern
				}
			}

			baseDir = baseDir.replace(/\/+$/, '')
			if (baseDir === '') baseDir = '.'

			const results = []
			try {
				const entries = this.db.readDir(baseDir, { depth: -1, includeDirs: false, skipStat: false })
				for await (const entry of entries) {
					if (entry.stat.isFile) {
						const relPath = entry.path

						if (filterPattern) {
							if (filterPattern === '**') {
								results.push({ path: relPath, isDb: false })
							} else {
								let regexStr = filterPattern
									.replace(/[-\/\\^$*+?.()|[\]{}]/g, (m) => {
										if (m === '*' || m === '?') return m
										return '\\' + m
									})
								regexStr = regexStr
									.replace(/\*\*/g, '.*')
									.replace(/\*/g, '[^/]*')
									.replace(/\?/g, '.')
								const regex = new RegExp(`^${regexStr}$`)
								const relativeToName = relPath.substring(baseDir === '.' ? 0 : baseDir.length + 1)
								if (regex.test(relativeToName) || regex.test(entry.name)) {
									results.push({ path: relPath, isDb: false })
								}
							}
						} else {
							results.push({ path: relPath, isDb: false })
						}
					}
				}
			} catch (e) {
				// Ignore directory read errors
			}
			return results
		}

		// 3. Single local file
		return [{ path: pathPattern, isDb: false }]
	}

	/**
	 * @param {string | Markdown} text
	 * @returns {Promise<string>}
	 */
	async encode(text) {
		const md = text instanceof Markdown ? text : new Markdown(text)
		let contentStr = String(md)

		// Find all links: [label](path)
		const linkRegex = /\[(.*?)\]\((.*?)\)/g
		let match
		const pathsToResolve = new Set()

		while ((match = linkRegex.exec(contentStr)) !== null) {
			const linkPath = match[2]
			if (linkPath && !linkPath.startsWith('http://') && !linkPath.startsWith('https://') && !linkPath.startsWith('#')) {
				pathsToResolve.add(linkPath)
			}
		}

		const injected = new Set()
		const boundaryBlocks = []

		for (const pathPattern of pathsToResolve) {
			const resolved = await this.resolvePaths(pathPattern)
			for (const { path, isDb } of resolved) {
				if (injected.has(path)) continue
				injected.add(path)

				try {
					const fileContent = await this.db.loadDocumentAs('.txt', path, null)
					if (typeof fileContent === 'string') {
						boundaryBlocks.push(`---boundary:${path}---`)
						boundaryBlocks.push(fileContent)
						boundaryBlocks.push('---boundary---')
					}
				} catch (e) {
					// Ignore missing files/workflows
				}
			}
		}

		if (boundaryBlocks.length > 0) {
			contentStr = contentStr.trimEnd() + '\n\n' + boundaryBlocks.join('\n') + '\n'
		}

		return contentStr
	}

	/**
	 * @param {string} text
	 */
	decode(text) {
		const lines = String(text).split('\n')
		const files = []
		let currentFile = null
		let hasOutsideMarkdown = false

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

		if (hasOutsideMarkdown || (files.length === 0 && String(text).includes('```'))) {
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
