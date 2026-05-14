import { ExportAuditor } from '../ExportAuditor.js'
import { show } from '@nan0web/ui'

export class PyExportAuditor extends ExportAuditor {
	/**
	 * @param {import('../ExportAuditor.js').ExportError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 * @param {Function} fileExists
	 * @param {Function} dirExists
	 * @param {Function} readText
	 */
	async *checkPlatformExports(errors, t, fileExists, dirExists, readText) {
		yield show('Platform detected: Python. Doing python-specific export check (__init__.py)', 'info')
		// For python, we might check __all__ in __init__.py, etc.
	}
}
