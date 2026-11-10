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
		title: 'Domain Auditor',
		description:
			'Enforces Model-as-Schema strictness, constructor field types, and strict domain/UI isolation.',
		starting: 'Starting Domain Audit in {dir}...',
		scanning: 'Scanning for Model-as-Schema violations...',
		violation_found: 'Model class outside src/domain/ in {file}',
		class_field_found: 'Class field outside constructor in {file} (line {line})',
		raw_fs_found:
			'Direct fs import detected in domain file {file} (line {line}). Use injected db instead.',
		raw_path_found:
			'Direct path import detected in domain file {file} (line {line}). Use db methods instead.',
		explicit_extension_found:
			'Redundant explicit file extension in {method}("{path}") in {file} (line {line}). NaN0Web DB resolves formats polymorphically. Omit extension.',
		platform_not_detected: 'Platform not detected. Skipping domain checks.',
		domain_ok: 'Domain/UI separation: OK',
	}

	/**
	 * Runs the domain strictness audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const { t } = this._

		yield progress(
			t(DomainAuditor.UI.starting, { dir: this.dir }) || `Starting Domain Audit in ${this.dir}...`
		)
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

		return result({ ok: errors.length === 0, success: errors.length === 0, errors, ...data })
	}

	/**
	 * @abstract
	 * @param {DomainError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *checkPlatformDomain(errors, t) {
		yield show(t(DomainAuditor.UI.platform_not_detected), 'warn')
		return {}
	}
}
