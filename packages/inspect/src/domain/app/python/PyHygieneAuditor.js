import { HygieneAuditor } from '../HygieneAuditor.js'
import { show } from '@nan0web/ui'

export class PyHygieneAuditor extends HygieneAuditor {
	/**
	 * @param {import('../HygieneAuditor.js').HygieneError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 */
	async *checkPlatformHygiene(errors, t) {
		yield show('Platform detected: Python', 'info')
		// Python-specific hygiene checks here (e.g. pytest, tox, requirements.txt)
	}
}
