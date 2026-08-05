import { ModelAsApp } from './ModelAsApp.js'
import { result } from '../core/Intent.js'

export class CodeTemplate extends ModelAsApp {
	static UI = {
		errorDb: 'No database available in the {target}',
	}
	static input = {
		help: 'Input data for the replacement in template',
		type: 'object',
		default: {},
	}
	static template = {
		help: 'Template content',
		default: '',
	}
	static templateFile = {
		help: 'Template file',
		default: '',
	}
	static prefix = {
		help: 'Prefix for replacement tags',
		type: 'string',
		default: '%%',
	}
	static suffix = {
		help: 'Suffix for replacement tags',
		type: 'string',
		default: '%%',
	}

	/**
	 * @param {Partial<CodeTemplate>} [data]
	 * @param {Partial<import('./ModelAsApp.js').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Record<string, string>} Input data for the replacement in template */ this.input
		/** @type {string} Template content */ this.template
		/** @type {string} Template filename */ this.templateFile
		/** @type {string} Prefix for replacement tags */ this.prefix
		/** @type {string} Suffix for replacement tags */ this.suffix
	}

	/**
	 * @param {string} [prefix=this.prefix]
	 * @param {string} [suffix=this.suffix]
	 * @returns {Promise<string>}
	 */
	async readTemplate(prefix = this.prefix || '%%', suffix = this.suffix || '%%') {
		const { db, t } = this._
		if (this.templateFile && !this.template) {
			if (!db) {
				throw new Error(t(CodeTemplate.UI.errorDb, { target: '/' }))
			}
			/** @type {import('@nan0web/db').DB} */
			const cwdDb = db.getMount('@cwd')
			if (!cwdDb) {
				throw new Error(t(CodeTemplate.UI.errorDb, { target: '@cwd' }))
			}
			this.template = await cwdDb.loadDocumentAs('.txt', this.templateFile)
		}
		let content = this.template || ''

		// Prettier normalization
		try {
			const prettier = await import('prettier')
			content = await prettier.format(content, { parser: 'babel' })
		} catch (_err) {
			// Fallback if prettier is not available
		}

		// Linear Loop Scanner (Zero RegExp, memory efficient)
		let resultStr = ''
		let cursor = 0

		while (cursor < content.length) {
			const tagPos = content.indexOf('@replace', cursor)
			if (tagPos === -1) {
				resultStr += content.slice(cursor)
				break
			}

			let openCommentStart = content.lastIndexOf('/*', tagPos)
			if (openCommentStart === -1 || openCommentStart < cursor) {
				openCommentStart = content.lastIndexOf('//', tagPos)
			}

			if (openCommentStart === -1 || openCommentStart < cursor) {
				resultStr += content.slice(cursor, tagPos + 8)
				cursor = tagPos + 8
				continue
			}

			let openCommentEnd = -1
			if (content.startsWith('/*', openCommentStart)) {
				openCommentEnd = content.indexOf('*/', tagPos)
				if (openCommentEnd !== -1) openCommentEnd += 2
			} else if (content.startsWith('//', openCommentStart)) {
				openCommentEnd = content.indexOf('\n', tagPos)
				if (openCommentEnd !== -1) openCommentEnd += 1
			}

			if (openCommentEnd === -1) {
				resultStr += content.slice(cursor, tagPos + 8)
				cursor = tagPos + 8
				continue
			}

			const rawKeyLine = content.slice(tagPos + 8, openCommentEnd)
			const key = rawKeyLine
				.split('\n')[0]
				.replace(/\*\/|\/\*|\*/g, '')
				.trim()

			if (!key) {
				resultStr += content.slice(cursor, openCommentEnd)
				cursor = openCommentEnd
				continue
			}

			const closeTagPos = content.indexOf('@replace', openCommentEnd)
			if (closeTagPos === -1) {
				resultStr += content.slice(cursor)
				break
			}

			let closeCommentEnd = -1
			if (content.indexOf('/*', closeTagPos) !== -1 || content.startsWith('/*', closeTagPos - 2)) {
				closeCommentEnd = content.indexOf('*/', closeTagPos)
				if (closeCommentEnd !== -1) closeCommentEnd += 2
			} else {
				closeCommentEnd = content.indexOf('\n', closeTagPos)
				if (closeCommentEnd !== -1) closeCommentEnd += 1
			}

			if (closeCommentEnd === -1) {
				resultStr += content.slice(cursor)
				break
			}

			resultStr += content.slice(cursor, openCommentEnd)
			if (!resultStr.endsWith('\n')) resultStr += '\n'
			resultStr += `${prefix}${key}${suffix}\n`
			const closeCommentBlock = content.slice(
				content.lastIndexOf('/*', closeTagPos),
				closeCommentEnd
			)
			resultStr += closeCommentBlock.startsWith('/*')
				? closeCommentBlock
				: content.slice(closeTagPos, closeCommentEnd)
			cursor = closeCommentEnd
		}

		return resultStr
	}

	/**
	 * Compiles input data into template
	 * @throws {Error} If no database available.
	 * @returns {AsyncGenerator<import('../core/Intent.js').Intent, import('../core/Intent.js').ResultIntent, any>}
	 */
	async *run() {
		const prefix = this.prefix || '%%'
		const suffix = this.suffix || '%%'
		let output = await this.readTemplate(prefix, suffix)
		for (const [target, value] of Object.entries(this.input)) {
			output = output.replaceAll(`${prefix}${target}${suffix}`, value)
		}
		return result({ output })
	}
}
