import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'
import Scanner from '../Release/Scanner.js'

export default class CloseCommand extends ModelAsApp {
	/** @type {string} Release version */
	version = ''

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
	}

	/**
	 * Compute destination path for closed contract test.
	 * Migrates *.spec.js from releases/ to src/tests/releases/*.test.js
	 * @param {string} path - Source path
	 * @returns {string}
	 */
	getDestinationPath(path) {
		const monorepoRoot = process.cwd()
		const relFromRoot = path.startsWith(monorepoRoot + '/')
			? path.slice(monorepoRoot.length + 1)
			: path

		if (relFromRoot.includes('releases/')) {
			const idx = relFromRoot.indexOf('releases/')
			const prefix = relFromRoot.slice(0, idx)
			const relPath = relFromRoot.slice(idx)
			return `${prefix}${relPath.replace(/^releases\//, 'src/tests/releases/').replace('.spec.js', '.test.js')}`
		}
		return relFromRoot.replace('.spec.js', '.test.js')
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const db = this._.db
		const v = this.version || ''
		yield show(`🛜 nan0release close ${v || 'all'}`)

		const targetRoot = process.env.RELEASE_CWD || process.cwd()
		const scanner = new Scanner(targetRoot)
		const specs = scanner.findSpecs(v)

		if (specs.length === 0) {
			yield show(`No pending specs found for version ${v || 'all'}`, 'warn')
			return result({})
		}

		yield show(`Running ${specs.length} pending specs...`)

		const files = specs.map((s) => s.path)
		const spawnResult = await runSpawn('node', ['--test', ...files])
		if (spawnResult.code !== 0) {
			yield show(`Specs stdout:\n${spawnResult.text || ''}`, 'warn')
			yield show(`Specs stderr:\n${spawnResult.error || ''}`, 'error')
			throw new Error(`Cannot close: Specs failed (code ${spawnResult.code})`)
		}

		yield show(`✅ Specs passed. Closing...`, 'success')

		let movedCount = 0
		const monorepoRoot = process.cwd()
		for (const spec of specs) {
			const absPath = spec.path
			const relFromRoot = absPath.startsWith(monorepoRoot + '/')
				? absPath.slice(monorepoRoot.length + 1)
				: absPath

			const destFromRoot = this.getDestinationPath(relFromRoot)

			if (db) {
				const content = await db.loadDocument(relFromRoot, null)
				if (content !== null) {
					await db.saveDocument(destFromRoot, content)
					await db.dropDocument(relFromRoot)
				}
			}
			movedCount++
		}

		yield show(`✅ Successfully closed ${movedCount} specs and moved to src/tests/releases/`, 'success')
		return result({ movedCount })
	}
}
