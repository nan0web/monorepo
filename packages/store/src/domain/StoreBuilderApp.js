import { Model } from '@nan0web/types'
import { progress, log, result } from '@nan0web/ui/core'
import { StoreRegistryModel } from './StoreRegistryModel.js'

/**
 * StoreBuilderApp — Агрегатор метаданих екосистеми (Version 2.8).
 * Діагностика: глибоке логування циклів.
 */
export class StoreBuilderApp extends Model {
	static UI = {
		title: 'Store Builder',
		description: 'Workspace aggregator for Global Registry',
		icon: '🏗️',
		scanning: '🔍 Scanning {path}...',
		found: '✅ Bound {count} entries in {project}',
		done: '🎉 Global registry updated: {file}',
		error: '❌ Error building store: {message}',
	}

	static output = {
		help: 'Path to the output CSV file',
		type: 'string',
		default: 'nan0web_store.csv',
	}

	/**
	 * @param {Partial<StoreBuilderApp> | Record<string, any>} [data] Initial state
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.output
	}

	async *run() {
		const t = this._.t || ((k) => k)
		const db = this._.db 
		
		yield progress(t(StoreBuilderApp.UI.scanning, { path: 'monorepo' }), 0)


		const registry = []
		const targets = ['apps', 'packages']

		for (const target of targets) {
			let entries = []
			try {
				entries = await db.listDir(target)
				yield log('debug', `Listed ${target}: ${entries.length} entries`)
			} catch (e) {
				yield log('error', `List error [${target}]: ${e.message}`)
				continue
			}
			
			let count = 0
			for (const entry of entries) {
				const pkgPath = `${entry.path}/package.json`
				const pkg = await db.get(pkgPath).catch((e) => {
					return null
				})
				
				if (pkg) {
					const item = new StoreRegistryModel({
						name: pkg.name,
						workspace: target,
						path: entry.path,
						version: pkg.version,
						description: pkg.description,
						tags: (pkg.keywords || []).join(';'),
					})

					registry.push(item)
					count++
				} else {
					yield log('debug', `No package.json at: ${pkgPath}`)
				}
			}
			yield log('info', t(StoreBuilderApp.UI.found, { count, project: target }))
		}

		const schema = StoreRegistryModel
		const fields = Object.keys(schema).filter(k => schema[k]?.type || schema[k]?.alias)
		const headers = fields.map(f => schema[f].alias || f).join(',')
		
		const lines = registry.map(item => 
			fields.map(f => (item[f] || '').toString().replace(/,/g, ';')).join(',')
		)
		
		const csvContent = [headers, ...lines].join('\n')
		await db.saveDocument(this.output, csvContent)

		yield result({
			status: 'success',
			message: t(StoreBuilderApp.UI.done, { file: this.output })
		})
	}
}

export default StoreBuilderApp
