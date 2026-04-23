import { Model } from '@nan0web/types'
import { progress, result } from '@nan0web/ui'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export class DocumentationAuditor extends Model {
	static UI = {
		checking: 'Checking documentation in {dir}',
		readmeJsNotFound: 'src/README.md.js not found',
		readmeJsFound: 'src/README.md.js found',
		readmeMdNotFound: 'README.md not found',
		readmeMdFound: 'README.md found',
		datasetNotFound: '.datasets/README.jsonl not found',
		datasetFound: '.datasets/README.jsonl found',
		checkingTranslations: 'Checking translations in docs/',
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
		yield progress(t(DocumentationAuditor.UI.checking, { dir: this.dir }))

		const reports = []
		let success = true

		const checks = [
			{ path: join(this.dir, 'src/README.md.js'), label: DocumentationAuditor.UI.readmeJsFound, error: DocumentationAuditor.UI.readmeJsNotFound },
			{ path: join(this.dir, 'README.md'), label: DocumentationAuditor.UI.readmeMdFound, error: DocumentationAuditor.UI.readmeMdNotFound },
			{ path: join(this.dir, '.datasets/README.jsonl'), label: DocumentationAuditor.UI.datasetFound, error: DocumentationAuditor.UI.datasetNotFound },
		]

		for (const check of checks) {
			if (existsSync(check.path)) {
				reports.push(t(check.label))
			} else {
				reports.push(t(check.error))
				success = false
			}
		}

		// TODO: Add more detailed translation checks in docs/

		return result({ reports }, success)
	}
}
