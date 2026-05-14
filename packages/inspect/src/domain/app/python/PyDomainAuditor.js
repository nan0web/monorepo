import { DomainAuditor } from '../DomainAuditor.js'
import { show } from '@nan0web/ui'

export class PyDomainAuditor extends DomainAuditor {
	/**
	 * @param {import('../DomainAuditor.js').DomainError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 */
	async *checkPlatformDomain(errors, t) {
		yield show('Platform detected: Python. Doing python-specific domain check.', 'info')
		// Implement python AST checking or regex for `class X(YieldBase):` outside domain
	}
}
