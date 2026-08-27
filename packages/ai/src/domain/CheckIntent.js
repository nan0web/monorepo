import { ModelAsApp } from '@nan0web/ui-cli'
import { spawn } from 'node:child_process'
import path from 'node:path'

/**
 * CheckIntent — Universal Multi-Format Contract & Syntax Validator (JS/TS, JSON, JSONL, SRT, VTT, Markdown).
 */
export class CheckIntent extends ModelAsApp {
	static alias = 'check'
	static UI = {
		title: 'Syntax & Contract Check',
		icon: '⚡',
	}

	static file = {
		help: 'File or glob pattern to validate',
		type: 'string',
		positional: true,
	}

	static files = {
		help: 'Files to validate (JS/TS, JSON, JSONL, SRT, VTT, Markdown)',
		type: 'array',
	}

	/**
	 * @param {Partial<CheckIntent> | Record<string, any>} [data] Initial state
	 * @param {any} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		super(data, /** @type {any} */ (options))
		/** @type {string[]} */
		this.files = Array.isArray(data.files) ? data.files : data.file ? [String(data.file)] : []
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { show, ask } = await import('@nan0web/ui')

		if (this.help) {
			const content = this.generateHelp()
			const title = /** @type {any} */ (this.constructor).UI?.title || 'Help'
			yield ask('help', { content, title: `${title} Help`, hint: 'content-viewer' })
			return
		}

		const {
			workspaceDb,
			workspaceRoot = process.cwd(),
			checker,
			t = (k) => k,
		} = /** @type {any} */ (this._)

		let targetFiles = [...this.files]

		// If no files provided, try to discover modified files from git
		if (targetFiles.length === 0) {
			targetFiles = await this._getModifiedFiles(workspaceRoot)
		}

		if (targetFiles.length === 0) {
			yield show(t('No modified files found to check.'), 'info')
			return
		}

		let checkedCount = 0

		for (const file of targetFiles) {
			let content = ''
			if (workspaceDb) {
				content = (await workspaceDb.fetch(file).catch(() => '')) || ''
			} else {
				const fs = await import('node:fs/promises')
				const fullPath = path.isAbsolute(file) ? file : path.resolve(workspaceRoot, file)
				content = await fs.readFile(fullPath, 'utf8').catch(() => '')
			}

			if (checker) {
				const res = await checker(content, file)
				if (!res.valid) {
					yield show(
						t('Check failed for {file}: {error}', {
							file,
							error: res.error || 'Validation error',
						}),
						'error'
					)
					return
				}
				checkedCount++
				continue
			}

			// Format detection and validation
			const validation = await this.validateFileContent(file, content, workspaceRoot)
			if (!validation.valid) {
				yield show(
					t('Check failed for {file}:\n{error}', {
						file,
						error: validation.error,
					}),
					'error'
				)
				return
			}
			checkedCount++
		}

		yield show(
			t('✔ Syntax & format check passed for {count} files.', { count: checkedCount }),
			'success'
		)
	}

	/**
	 * Validates file content based on extension.
	 * @param {string} file
	 * @param {string} content
	 * @param {string} root
	 * @returns {Promise<{ valid: boolean, error?: string }>}
	 */
	async validateFileContent(file, content, root) {
		const ext = path.extname(file).toLowerCase()

		// 1. JavaScript / TypeScript
		if (['.js', '.mjs', '.cjs', '.ts'].includes(ext)) {
			return this._checkSyntaxNode(file, root)
		}

		// 2. JSON
		if (ext === '.json') {
			try {
				JSON.parse(content)
				return { valid: true }
			} catch (e) {
				return { valid: false, error: `Invalid JSON syntax: ${e.message}` }
			}
		}

		// 3. JSONL / NDJSON
		if (['.jsonl', '.ndjson'].includes(ext)) {
			const lines = content.split('\n')
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim()
				if (!line) continue
				try {
					JSON.parse(line)
				} catch (e) {
					return { valid: false, error: `Invalid JSON at line ${i + 1}: ${e.message}` }
				}
			}
			return { valid: true }
		}

		// 4. Subtitles (SRT / VTT)
		if (['.srt', '.vtt'].includes(ext)) {
			return this.validateSubtitles(content, ext)
		}

		// 5. Markdown (.md)
		if (ext === '.md') {
			return this.validateMarkdown(content)
		}

		return { valid: true }
	}

	/**
	 * Validate SRT or VTT subtitle structure and timestamp sequences.
	 * @param {string} content
	 * @param {string} ext
	 * @returns {{ valid: boolean, error?: string }}
	 */
	validateSubtitles(content, ext) {
		const trimmed = content.trim()
		if (!trimmed) return { valid: true }

		const timePattern =
			ext === '.srt'
				? /\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/
				: /(?:\d{2}:)?\d{2}:\d{2}[,\.]\d{3}\s*-->\s*(?:\d{2}:)?\d{2}:\d{2}[,\.]\d{3}/

		const blocks = trimmed.split(/\n\s*\n/)
		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i].trim()
			if (!block) continue
			const lines = block.split('\n')

			// Needs at least timing line and text line
			const hasTiming = lines.some((l) => timePattern.test(l))
			if (!hasTiming) {
				return {
					valid: false,
					error: `Malformed subtitle block #${i + 1}: Missing timestamp line (00:00:00,000 --> 00:00:00,000)`,
				}
			}
		}

		return { valid: true }
	}

	/**
	 * Validate Markdown for balanced code blocks and basic integrity.
	 * @param {string} content
	 * @returns {{ valid: boolean, error?: string }}
	 */
	validateMarkdown(content) {
		const lines = content.split('\n')
		let inCodeBlock = false
		let codeBlockStart = 0

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()
			if (line.startsWith('```')) {
				inCodeBlock = !inCodeBlock
				if (inCodeBlock) codeBlockStart = i + 1
			}
		}

		if (inCodeBlock) {
			return {
				valid: false,
				error: `Unclosed code block starting at line ${codeBlockStart}`,
			}
		}

		return { valid: true }
	}

	/**
	 * @param {string} root
	 * @returns {Promise<string[]>}
	 */
	async _getModifiedFiles(root) {
		return new Promise((resolve) => {
			const proc = spawn('git', ['status', '--porcelain'], { cwd: root })
			let stdout = ''
			proc.stdout.on('data', (d) => (stdout += d))
			proc.on('close', () => {
				const files = stdout
					.split('\n')
					.map((line) => line.trim().slice(3))
					.filter(Boolean)
				resolve(files)
			})
			proc.on('error', () => resolve([]))
		})
	}

	/**
	 * @param {string} file
	 * @param {string} root
	 * @returns {Promise<{ valid: boolean, error?: string }>}
	 */
	async _checkSyntaxNode(file, root) {
		const invokingCwd = process.env.INIT_CWD || process.cwd()
		let fullPath = path.isAbsolute(file) ? file : path.resolve(invokingCwd, file)
		if (!path.isAbsolute(file) && !(await import('node:fs')).existsSync(fullPath)) {
			fullPath = path.resolve(root, file)
		}
		return new Promise((resolve) => {
			const proc = spawn('node', ['--check', fullPath])
			let stderr = ''
			proc.stderr.on('data', (d) => (stderr += d))
			proc.on('close', (code) => {
				if (code === 0) resolve({ valid: true })
				else resolve({ valid: false, error: stderr.trim() })
			})
			proc.on('error', (err) => resolve({ valid: false, error: err.message }))
		})
	}
}
