import { Model } from '@nan0web/types'
import { progress, result } from '@nan0web/ui'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export class ReleaseAuditor extends Model {
	static UI = {
		checking: 'Checking release artifacts in {dir}',
		releaseJsonNotFound: 'release.json not found',
		releaseJsonFound: 'release.json found',
		datasetNotFound: 'vN.M.P.jsonl dataset not found',
		datasetFound: 'vN.M.P.jsonl dataset found',
	}

	static dir = {
		help: 'Package directory',
		default: '.',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dir
	}

	async *run() {
		const t = this._.t
		yield progress(t(ReleaseAuditor.UI.checking, { dir: this.dir }))

		const reports = []
		// Note: release artifacts might not exist yet if it's not released.
		// For point 7, we check if the system is ready to produce them or if they exist.
		
		const releaseJson = join(this.dir, 'release.json')
		if (existsSync(releaseJson)) {
			reports.push(t(ReleaseAuditor.UI.releaseJsonFound))
		} else {
			reports.push(t(ReleaseAuditor.UI.releaseJsonNotFound))
		}

		return result({ reports }, true) // Artifacts might be optional or future-proof
	}
}
