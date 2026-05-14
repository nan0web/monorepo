import { AuditorModel } from '../AuditorModel.js'
import { progress, result } from '@nan0web/ui'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

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
		const t = (this._.t)
		yield progress(t(StructureAuditor.UI.checking, { dir: this.dir }))

		const systemMdPath = join(this.dir, 'system.md')
		const playgroundPath = join(this.dir, 'playground')

		const errors = []
		let success = true

		if (existsSync(systemMdPath)) {
			yield progress(t(StructureAuditor.UI.systemMdFound))
		} else {
			errors.push({ check: 'system.md', error: t(StructureAuditor.UI.systemMdNotFound) })
			success = false
		}

		if (existsSync(playgroundPath)) {
			yield progress(t(StructureAuditor.UI.playgroundFound))
		} else {
			errors.push({ check: 'playground/', error: t(StructureAuditor.UI.playgroundNotFound) })
			success = false
		}

		return result({ errors, success })
	}
}
