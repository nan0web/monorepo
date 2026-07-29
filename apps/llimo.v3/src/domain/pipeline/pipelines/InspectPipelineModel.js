import { ModelAsApp, show, result } from '@nan0web/ui'

/**
 * @extends {ModelAsApp}
 * @property {string | string[]} auditors
 */
export class InspectPipelineModel extends ModelAsApp {
	static alias = 'inspect'
	static UI = {
		title: '🔍 Running Inspectors',
		noAuditors: 'No auditors specified.',
	}

	static auditors = {
		help: 'Comma-separated list of auditor aliases',
		default: 'architecture',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string | string[]} */ this.auditors
	}

	async *run() {
		const { t } = this._
		const names = typeof this.auditors === 'string'
			? this.auditors.split(',').map(s => s.trim()).filter(Boolean)
			: Array.isArray(this.auditors) ? this.auditors : []

		if (names.length === 0) {
			yield show(t(InspectPipelineModel.UI.noAuditors), 'warn')
			return result({ ok: false })
		}

		const InspectorApp = (await import('@nan0web/inspect/ui/cli')).default
		const results = []

		for (const name of names) {
			const inspector = new InspectorApp(
				{ command: /** @type {any} */ (name), dir: '.' },
				this._
			)
			const res = yield* inspector.run()
			results.push({ auditor: name, ...res })
		}

		const allOk = results.every(r => {
			const d = r.data || r
			return d.ok === true || d.success === true
		})
		return result({ ok: allOk, results })
	}
}
