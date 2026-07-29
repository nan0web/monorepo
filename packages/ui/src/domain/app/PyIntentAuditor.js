import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'
import { result, show, progress } from '../../core/Intent.js'
import { IntentAuditor } from './IntentAuditor.js'

/**
 * PyIntentAuditor — Specialized auditor for Python output hygiene.
 */
export class PyIntentAuditor extends AuditorModel {
	/** @type {string[]} Directories to ignore during scanning */
	static IGNORE_DIRS = ['node_modules', '.git', '.venv', '.datasets', 'dist', 'build', 'types', 'play', 'test', 'tests']

	/**
	 * Checks if a directory or file should be ignored.
	 * @param {string} name
	 * @returns {boolean}
	 */
	static isIgnored(name) {
		return name.startsWith('.') || PyIntentAuditor.IGNORE_DIRS.includes(name)
	}

	/**
	 * Run the Python-specific intent audit.
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
			for await (const entry of fsDb.browse(targetDir, { depth: Infinity, ignore: PyIntentAuditor.IGNORE_DIRS })) {
				if (PyIntentAuditor.isIgnored(entry.name)) continue
				
				if (
					entry.isFile && 
					/\.py$/.test(entry.name) && 
					!entry.name.startsWith('test_') &&
					!entry.name.endsWith('_test.py') &&
					!entry.path.includes('/tests/')
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

			const fileErrors = PyIntentAuditor.inspectFileContent(contentString, t)
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
	 * Inspects Python file content for print or sys.stdout/stderr writes.
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

			// Python Comment skip
			if (trimmed.startsWith('#')) {
				return
			}

			// 1. Python print statement check
			const printMatch = trimmed.match(/\bprint\(/)
			if (printMatch) {
				const codeBeforeComment = trimmed.split('#')[0]
				if (codeBeforeComment.includes(printMatch[0])) {
					errors.push(
						t(IntentAuditor.UI.errorPrintLeak, {
							line: lineNum,
							match: 'print(...)',
						}),
					)
				}
			}

			// 2. sys.stdout/stderr write check
			const sysMatch = trimmed.match(/\bsys\.(stdout|stderr)\.write\(/)
			if (sysMatch) {
				const codeBeforeComment = trimmed.split('#')[0]
				if (codeBeforeComment.includes(sysMatch[0])) {
					errors.push(
						t(IntentAuditor.UI.errorSysWriteLeak, {
							line: lineNum,
							match: sysMatch[0] + '...',
						}),
					)
				}
			}
		})

		return errors
	}
}

export default PyIntentAuditor
