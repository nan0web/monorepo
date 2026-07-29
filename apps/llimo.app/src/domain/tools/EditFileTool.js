import { ModelAsApp } from '@nan0web/ui-cli'
import { show, result } from '@nan0web/ui'
import { applyBoundaries } from '@nan0web/ai'

/**
 * EditFileTool — edits a file using boundary protocol.
 *
 * Two modes:
 * 1. Full file: no startLine/lineCount → writes `content` as entire file
 * 2. Snippet: startLine + lineCount → replaces that range using `applyBoundaries()`
 *
 * @example
 * // Full file write
 * new EditFileTool({ path: 'new.js', content: 'hello' }, { db })
 *
 * // Snippet edit (replace 2 lines starting at line 3)
 * new EditFileTool({ path: 'app.js', startLine: 3, lineCount: 2, content: 'X\nY' }, { db })
 */
export class EditFileTool extends ModelAsApp {
	static alias = 'edit'
	static UI = { title: 'Edit File', icon: '✏️' }

	static path = {
		help: 'File path to edit',
		positional: true,
	}
	static startLine = {
		help: 'Start line for snippet edit (1-indexed)',
		type: 'number',
		default: undefined,
	}
	static lineCount = {
		help: 'Number of lines to replace',
		type: 'number',
		default: undefined,
	}
	static content = {
		help: 'New content (full file or snippet replacement)',
		default: '',
	}

	/**
	 * @param {Record<string, any>} [data={}]
	 * @param {Record<string, any>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} File path */ this.path
		/** @type {number | undefined} Start line */ this.startLine
		/** @type {number | undefined} Line count */ this.lineCount
		/** @type {string} Content */ this.content
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

		const isSnippet = this.startLine != null && this.lineCount != null

		if (isSnippet) {
			// Snippet mode: use applyBoundaries
			let original = ''
			try {
				original = String(await db.get(this.path) ?? '')
			} catch {
				original = ''
			}

			const key = `${this.path}:${this.startLine}:${this.lineCount}`
			const updated = applyBoundaries(
				{ [this.path]: original },
				{ [key]: this.content }
			)

			await db.set(this.path, updated[this.path])

			const endLine = Number(this.startLine) + Number(this.lineCount) - 1
			yield show(`Edited ${this.path} lines ${this.startLine}-${endLine}`)
		} else {
			// Full file mode: write entire content
			await db.set(this.path, this.content)
			yield show(`Created ${this.path}`)
		}

		return result({ path: this.path, edited: true })
	}
}
