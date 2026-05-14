import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show } from '@nan0web/ui'

/**
 * @typedef {Object} ExportError
 * @property {string} check Name of the export check.
 * @property {string} error Error key for i18n.
 */

/**
 * ExportAuditor — Verifies named exports, domain facades, and UI adapter exports.
 */
export class ExportAuditor extends AuditorModel {
	static alias = 'exports'

	/** @type {Object<string, string>} UI messages for export steps */
	static UI = {
		starting: 'Starting Export Audit in {dir}...',
		checking_gateway: 'Checking main src/index.js gateway...',
		checking_domain: 'Checking domain facade...',
		checking_ui_exports: 'Checking UI adapter exports...',
		missing_index: 'Missing src/index.js (main package gateway)',
		missing_domain_index: 'src/domain/ exists but src/domain/index.js is missing',
		missing_ui_export: 'UI adapter dir {dir}/ exists but not declared in package.json exports',
		gateway_ok: 'Main gateway: OK',
		domain_ok: 'Domain facade: OK (or no domain dir)',
		ui_ok: 'UI exports: OK',
	}

	/**
	 * Runs the export integrity audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t

		yield progress(t(ExportAuditor.UI.starting, { dir: this.dir }) || `Starting Export Audit in ${this.dir}...`)

		/** @type {ExportError[]} */
		const errors = []

		/** @param {string} rel */

		/** @param {string} rel */

		/** @param {string} rel */
		const readText = async (rel) => {
			try {
				const { db } = this._
				if (!db) throw new Error('DB not found in context')
				const val = await db.loadDocument(db.resolveSync(this.dir, rel))
				return typeof val === 'string' ? val : (val && val.toString ? val.toString() : '')
			} catch {
				return null
			}
		}

		const gen = this.checkPlatformExports(errors, t, this.fileExists.bind(this), this.dirExists.bind(this), readText)
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
	 * @param {ExportError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 * @param {Function} fileExists
	 * @param {Function} dirExists
	 * @param {Function} readText
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *checkPlatformExports(errors, t, fileExists, dirExists, readText) {
		yield show('Platform not detected. Skipping export checks.', 'warn')
		return {}
	}
}
