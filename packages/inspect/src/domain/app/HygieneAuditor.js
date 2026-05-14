import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show } from '@nan0web/ui'

/**
 * @typedef {Object} HygieneError
 * @property {string} check Name of the check being performed.
 * @property {string} error Error key for i18n.
 */

/**
 * HygieneAuditor — Verifies required package scripts and configuration files.
 */
export class HygieneAuditor extends AuditorModel {
	static alias = 'hygiene'

	/** @type {Object<string, string>} UI messages for hygiene steps */
	static UI = {
		starting: 'Starting Hygiene Audit in {dir}...',
		checking_scripts: 'Checking package scripts...',
		checking_configs: 'Checking config files...',
		incomplete_test_all: 'Incomplete test:all chain, missing: {missing}',
		missing_script: 'Missing required script: {script}',
		missing_prebuild: 'Missing prebuild cleanup (rm -rf dist types)',
		missing_config: 'Missing config file: {file}',
		no_package_json: 'package.json not found or invalid',
		scripts_ok: 'All required scripts present.',
		configs_ok: 'All config files present.',
		platform_js: 'Platform detected: JavaScript/Node.js',
		platform_unknown: 'Platform not detected. Skipping JS-specific hygiene checks.',
	}

	/**
	 * Runs the hygiene audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t

		yield progress(t(HygieneAuditor.UI.starting, { dir: this.dir }) || `Starting Hygiene Audit in ${this.dir}...`)

		/** @type {HygieneError[]} */
		const errors = []

		const gen = this.checkPlatformHygiene(errors, t)
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
	 * Abstract check for platform hygiene.
	 * @param {HygieneError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *checkPlatformHygiene(errors, t) {
		yield show(t(HygieneAuditor.UI.platform_unknown, {}) || 'Platform not detected. Skipping JS-specific hygiene checks.', 'warn')
		return {}
	}
}
