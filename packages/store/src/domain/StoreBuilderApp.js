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
		if (!db) {
			yield log('error', t(StoreBuilderApp.UI.error, { message: 'Database not initialized' }))
			return result({ status: 'error', message: 'Database not initialized' })
		}

		yield progress(t(StoreBuilderApp.UI.scanning, { path: 'monorepo' }), 0)


		const registry = []
		const targets = ['apps', 'packages', '.packages']
		const defaultIgnore = [
			'node_modules',
			'dist',
			'releases',
			'__snapshots__',
			'snapshots',
			'playwright-report',
			'test-results',
			'coverage',
			'.git',
			'.next',
			'.venv',
			'.datasets',
			'bin',
			'build',
			'out',
			'.cache',
			'play',
		]

		const scanDir = async (dir, workspaceName) => {
			let entries = []
			try {
				entries = await db.listDir(dir)
			} catch (e) {
				return
			}

			const hasPkg = entries.some((e) => e.name === 'package.json')
			if (hasPkg) {
				const pkgPath = `${dir}/package.json`
				const pkg = await db.get(pkgPath).catch(() => null)
				if (pkg) {
					const item = new StoreRegistryModel({
						name: pkg.name,
						workspace: workspaceName,
						path: dir,
						version: pkg.version,
						description: pkg.description || '',
						tags: Array.isArray(pkg.keywords) ? pkg.keywords.join(';') : '',
					})
					registry.push(item)
					return
				}
			}

			for (const entry of entries) {
				if (entry.isDirectory) {
					if (defaultIgnore.includes(entry.name) || entry.name.startsWith('.')) {
						continue
					}
					await scanDir(entry.path, workspaceName)
				}
			}
		}

		for (const target of targets) {
			const startCount = registry.length
			yield log('debug', `Scanning workspace [${target}] recursively...`)
			await scanDir(target, target)
			const count = registry.length - startCount
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
