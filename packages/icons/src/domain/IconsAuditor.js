import { Model } from '@nan0web/types'
import { progress, result, show, log, agent } from '@nan0web/ui'

/**
 * IconsAuditor — Verifies that complex emojis are NOT used in UI text.
 * Enforces usage of @nan0web/icons and /adapters/cli for compact 1-char representations.
 */
export class IconsAuditor extends Model {
	static alias = 'icons'

	static dir = {
		help: 'Target directory to audit',
		type: 'string',
		default: '.',
		positional: true,
	}

	static help = {
		help: 'Show help',
		default: false,
	}

	static UI = {
		starting: 'Starting Icons Audit in {dir}...',
		emojiFound: '🚨 Heavy emoji found in {file}. Replace with @nan0web/icons.',
		success: '✅ All icons are compliant.',
		helpMessage: '# 🛠️ Icons Auditor\n\nScans JavaScript models to ensure compact 1-char icons from `@nan0web/icons` are used instead of heavy emojis.',
	}

	/**
	 * @param {Partial<IconsAuditor> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dir
		/** @type {boolean} */ this.help
	}

	async *run() {
		/** @type {import('@nan0web/types').ModelOptions & { db: import('@nan0web/db').default }} */
		const _ = this._
		const t = _.t

		if (this.help) {
			yield log(t(IconsAuditor.UI.helpMessage, {}))
			return result({ success: true })
		}

		yield progress(t(IconsAuditor.UI.starting, { dir: this.dir }))
		
		const errors = []
		
		// 1. Basic check logic: Read files recursively from this._.db (DBFS)
		if (_.db) {
			const files = await this._scanFiles(this.dir)
			const emojisToFind = ['✅', '🚨', '🏖', '🖥️', '📡', '🔭', '🧪']

			for (const file of files) {
				const content = await _.db.fetch(file)
				if (typeof content !== 'string') continue

				const foundEmojis = emojisToFind.filter(e => content.includes(e))
				if (foundEmojis.length > 0) {
					errors.push({ 
						file, 
						emojis: foundEmojis 
					})
				}
			}
		}

		if (errors.length > 0) {
			const readme = await _.db.fetch('README.md').catch(() => '')
			
			// Build files object for context
			const filesData = { 'README.md': typeof readme === 'string' ? readme : '' }
			for (const err of errors) {
				const content = await _.db.fetch(err.file)
				filesData[err.file] = typeof content === 'string' ? content : ''
			}

			// Subagent Architecture: Delegate fixing the code to an AI subagent!
			const agentResult = yield agent(
				'Replace heavy emojis with @nan0web/icons representations',
				{
					instructions: [`Replace hardcoded emojis with single-character equivalents or iconChar() imports from @nan0web/icons.`],
					files: filesData,
					data: {
						violations: errors
					}
				}
			)

			if (!agentResult || !agentResult.success) {
				return result({ success: false, errors })
			}

			// Apply the fully resolved files provided by the Subagent Orchestrator
			if (agentResult.files) {
				for (const [filePath, content] of Object.entries(agentResult.files)) {
					if (filePath !== 'README.md') {
						await _.db.write(filePath, content)
					}
				}
			}
		}

		yield show(t(IconsAuditor.UI.success, {}))
		return result({ success: true })
	}

	async _scanFiles(currentDir) {
		/** @type {import('@nan0web/types').ModelOptions & { db: import('@nan0web/db').default }} */
		const _ = this._
		const resultFiles = []
		try {
			for await (const entry of _.db.readDir(currentDir)) {
				if (entry.isDirectory && !entry.name.includes('node_modules')) {
					const subFiles = await this._scanFiles(entry.path)
					resultFiles.push(...subFiles)
				} else if (entry.isFile && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
					resultFiles.push(entry.path)
				}
			}
		} catch (err) {
			// Ignored
		}
		return resultFiles
	}
}
