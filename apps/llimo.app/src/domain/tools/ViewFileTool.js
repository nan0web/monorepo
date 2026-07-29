import { ModelAsApp } from '@nan0web/ui-cli'
import { show, result } from '@nan0web/ui'

/**
 * ViewFileTool — reads a file and displays it with line numbers.
 *
 * Supports partial view via startLine/endLine (1-indexed, inclusive).
 * Returns { path, lines } on success, { error: true } on failure.
 *
 * @example
 * const tool = new ViewFileTool({ path: 'src/app.js' }, { db })
 * yield* tool.run() // shows numbered lines, returns { path, lines }
 */
export class ViewFileTool extends ModelAsApp {
	static alias = 'view'
	static UI = { title: 'View File', icon: '📄' }

	static path = {
		help: 'File path to read',
		positional: true,
	}
	static startLine = {
		help: 'Start line (1-indexed, inclusive)',
		type: 'number',
		default: undefined,
	}
	static endLine = {
		help: 'End line (1-indexed, inclusive)',
		type: 'number',
		default: undefined,
	}

	/**
	 * @param {Record<string, any>} [data={}]
	 * @param {Record<string, any>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} File path */ this.path
		/** @type {number | undefined} Start line */ this.startLine
		/** @type {number | undefined} End line */ this.endLine
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const db = this._.db
		if (!db) {
			yield show('No database configured')
			return result({ error: true })
		}

		let content
		try {
			content = await db.get(this.path)
		} catch {
			content = null
		}

		if (content == null) {
			yield show(`File not found: ${this.path}`)
			return result({ error: true, path: this.path })
		}

		const allLines = String(content).split('\n')
		const start = (this.startLine ?? 1) - 1
		const end = this.endLine ?? allLines.length
		const slice = allLines.slice(start, end)

		const numbered = slice
			.map((line, i) => `${start + i + 1}: ${line}`)
			.join('\n')

		yield show(numbered)

		return result({
			path: this.path,
			lines: allLines.length,
			showing: { start: start + 1, end: Math.min(end, allLines.length) },
		})
	}
}
