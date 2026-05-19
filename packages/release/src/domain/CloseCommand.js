import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'
import Scanner from '../Release/Scanner.js'

export default class CloseCommand extends ModelAsApp {
	static version = {
		help: 'Release version',
		default: '',
	}
	static UI = {
		title: 'close',
		help: 'Close a release and move tests to src/',
	}

	/**
	 * @param {Partial<CloseCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Release version */ this.version
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { renameSync, mkdirSync } = await import('node:fs')
		const { join, dirname } = await import('node:path')

		const v = this.version || ''
		yield show(`🛜 nan0release close ${v || 'all'}`)

		const scanner = new Scanner(process.cwd())
		const specs = scanner.findSpecs(v)

		if (specs.length === 0) {
			yield show(`No pending specs found for version ${v || 'all'}`, 'warn')
			return result({})
		}

		yield show(`Running ${specs.length} pending specs...`)

		const files = specs.map((s) => s.path)
		const spawnResult = await runSpawn('node', ['--test', ...files])
		if (spawnResult.code !== 0) {
			throw new Error('Cannot close: Specs failed')
		}

		yield show(`✅ Specs passed. Closing...`, 'success')

		let movedCount = 0
		for (const spec of specs) {
			const relativePath = spec.path.substring(process.cwd().length + 1)
			const destRelative = relativePath
				.replace(/^releases\//, 'src/releases/')
				.replace('.spec.js', '.test.js')
			const destPath = join(process.cwd(), destRelative)

			mkdirSync(dirname(destPath), { recursive: true })
			renameSync(spec.path, destPath)
			movedCount++
		}

		yield show(`✅ Successfully closed ${movedCount} specs and moved to src/releases/`, 'success')
		return result({})
	}
}
