import { AuditorModel } from '../AuditorModel.js'
import { progress, result } from '@nan0web/ui'

export class StructureAuditor extends AuditorModel {
	static UI = {
		checking: 'Checking package structure in {dir}',
		systemMdNotFound: 'system.md not found',
		systemMdFound: 'system.md found',
		playgroundNotFound: 'playground/ directory not found',
		playgroundFound: 'playground/ directory found',
	}

	async *run() {
		/** @type {(key: string, data?: Record<string, any>) => string} */
		const t = this._.t
		yield progress(t(StructureAuditor.UI.checking, { dir: this.dir }))

		const errors = []
		let success = true

		if (await this.fileExists('system.md')) {
			yield progress(t(StructureAuditor.UI.systemMdFound))
		} else {
			errors.push({ check: 'system.md', error: t(StructureAuditor.UI.systemMdNotFound) })
			success = false
		}

		if (await this.dirExists('playground')) {
			yield progress(t(StructureAuditor.UI.playgroundFound))
		} else {
			errors.push({ check: 'playground/', error: t(StructureAuditor.UI.playgroundNotFound) })
			success = false
		}

		return result({ ok: success, success, errors })
	}
}
