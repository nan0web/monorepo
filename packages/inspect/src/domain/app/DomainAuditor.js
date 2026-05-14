import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show } from '@nan0web/ui'

/**
 * @typedef {Object} DomainError
 * @property {string} file File where the violation was found.
 * @property {string} error Error key for i18n.
 */

/**
 * DomainAuditor — Enforces Model-as-Schema strictness and domain isolation.
 */
export class DomainAuditor extends AuditorModel {
	static alias = 'domain'

	/** @type {Object<string, string>} UI messages for domain steps */
	static UI = {
		starting: 'Starting Domain Audit in {dir}...',
		scanning: 'Scanning for Model-as-Schema violations...',
		violation_found: 'Model class outside src/domain/ in {file}',
		class_field_found: 'Class field outside constructor in {file} (line {line})',
		domain_ok: 'Domain/UI separation: OK',
	}

	/**
	 * Runs the domain strictness audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t

		yield progress(t(DomainAuditor.UI.starting, { dir: this.dir }) || `Starting Domain Audit in ${this.dir}...`)
		yield progress(t(DomainAuditor.UI.scanning, {}) || 'Scanning for domain violations...')

		/** @type {DomainError[]} */
		const errors = []

		const gen = this.checkPlatformDomain(errors, t)
		let data = {}
		while (true) {
			const res = await gen.next()
			if (res.done) {
				data = res.value || {}
				break
			}
			yield res.value
		}

		return result({ success: errors.length === 0, errors, ...data })
	}

	/**
	 * @abstract
	 * @param {DomainError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *checkPlatformDomain(errors, t) {
		yield show('Platform not detected. Skipping domain checks.', 'warn')
		return {}
	}
}
