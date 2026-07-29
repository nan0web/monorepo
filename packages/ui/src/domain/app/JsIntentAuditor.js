import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'
import { result, show, progress } from '../../core/Intent.js'
import { IntentAuditor } from './IntentAuditor.js'

/**
 * JsIntentAuditor — Specialized auditor for JS/TS output hygiene.
 */
export class JsIntentAuditor extends AuditorModel {
	/** @type {string[]} Directories to ignore during scanning */
	static IGNORE_DIRS = ['node_modules', '.git', '.venv', '.datasets', 'dist', 'build', 'types', 'play', 'test', 'examples', 'scripts']

	/**
	 * Checks if a directory or file should be ignored.
	 * @param {string} name
	 * @returns {boolean}
	 */
	static isIgnored(name) {
		return name.startsWith('.') || JsIntentAuditor.IGNORE_DIRS.includes(name)
	}

	/**
	 * Run the JS-specific intent audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = /** @type {any} */ (this)._
		yield show(t(IntentAuditor.UI.starting, { dir: /** @type {any} */ (this).dir }))

		const fsDb = /** @type {any} */ (this)._.db
		if (!fsDb) {
			yield show(t(IntentAuditor.UI.errorDb), 'error')
			return result({ success: false })
		}

		const files = []
		const targetDir = fsDb.resolveSync(/** @type {any} */ (this).dir)

		try {
			for await (const entry of fsDb.browse(targetDir, { depth: Infinity, ignore: JsIntentAuditor.IGNORE_DIRS })) {
				if (JsIntentAuditor.isIgnored(entry.name)) continue
				
				if (
					entry.isFile && 
					/\.(js|ts|jsx|tsx)$/.test(entry.name) && 
					!entry.name.endsWith('.test.js') &&
					!entry.name.endsWith('.story.js') &&
					!entry.path.includes('/test/') &&
					!entry.path.includes('/play/')
				) {
					files.push(entry.path)
				}
			}
		} catch (e) {
			// Directory might be missing
		}

		if (files.length === 0) {
			yield show(t(IntentAuditor.UI.doneSuccess, {}), 'success')
			return result({ success: true })
		}

		let hasErrors = false
		const allErrors = []

		for (const file of files) {
			const displayFile = file.startsWith('@app/') ? file.slice(5) : file
			const content = await fsDb.fetch(file)
			const contentString = typeof content === 'string' ? content : JSON.stringify(content)

			const fileErrors = JsIntentAuditor.inspectFileContent(contentString, t)
			if (fileErrors.length > 0) {
				const errorMessages = fileErrors.join('; ')
				yield show(
					t(IntentAuditor.UI.auditFailed, { file: displayFile, errors: errorMessages }),
					'error',
				)
				allErrors.push(...fileErrors.map((e) => ({ file: displayFile, error: e })))
				hasErrors = true
			} else {
				yield progress(t(IntentAuditor.UI.auditPassed, { file: displayFile }))
			}
		}

		if (hasErrors) {
			yield show(t(IntentAuditor.UI.doneErrors, {}), 'error')
			return result({ success: false, errors: allErrors })
		}

		yield show(t(IntentAuditor.UI.doneSuccess, {}), 'success')
		return result({ success: true })
	}

	/**
	 * Inspects file content for console.* or process.* writes.
	 * @param {string} content Content of the file.
	 * @param {import('@nan0web/i18n').TFunction} t Translate function.
	 * @returns {string[]} List of error messages.
	 */
	static inspectFileContent(content, t) {
		const errors = []
		const lines = content.split('\n')

		lines.forEach((lineText, index) => {
			const lineNum = index + 1
			const trimmed = lineText.trim()

			// Skip comments
			if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
				return
			}

			// 1. Thorough console.* statement scan (including table, trace, etc.)
			const consoleMatch = trimmed.match(/console\.(log|error|warn|info|debug|dir|table|trace|assert)\(/)
			if (consoleMatch) {
				const codeBeforeComment = trimmed.split('//')[0]
				if (codeBeforeComment.includes(consoleMatch[0])) {
					errors.push(
						t(IntentAuditor.UI.errorConsoleLeak, {
							line: lineNum,
							match: consoleMatch[0] + '...',
						}),
					)
				}
			}

			// 2. process.stdout/stderr write scan
			const processMatch = trimmed.match(/process\.(stdout|stderr)\.write\(/)
			if (processMatch) {
				const codeBeforeComment = trimmed.split('//')[0]
				if (codeBeforeComment.includes(processMatch[0])) {
					errors.push(
						t(IntentAuditor.UI.errorProcessLeak, {
							line: lineNum,
							match: processMatch[0] + '...',
						}),
					)
				}
			}
		})

		return errors
	}
}

export default JsIntentAuditor
