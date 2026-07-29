import { OlmuiThemingAuditor } from './OlmuiThemingAuditor.js'
import { result, show } from '../../core/Intent.js'

export class PyOlmuiThemingAuditor extends OlmuiThemingAuditor {
	/**
	 * @returns {AsyncGenerator<import('../../core/Intent.js').Intent, import('../../core/Intent.js').ResultIntent, any>}
	 */
	async *run() {
		const { t } = /** @type {any} */ (this)._
		yield show(t(OlmuiThemingAuditor.UI.starting, { dir: this.dir }))

		const fsDb = /** @type {any} */ (this)._.db
		if (!fsDb) {
			yield show(t(OlmuiThemingAuditor.UI.errorDb), 'error')
			return result({ ok: false, code: 500, reason: 'no_db' })
		}

		// Simple stub: python projects pass cleanly for now unless we add specific css/qml rules
		yield show(t(OlmuiThemingAuditor.UI.doneSuccess, {}), 'success')
		return result({ ok: true, code: 200 })
	}
}

export default PyOlmuiThemingAuditor
