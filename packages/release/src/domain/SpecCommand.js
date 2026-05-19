import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'
import Scanner from '../Release/Scanner.js'

export default class SpecCommand extends ModelAsApp {
	static version = {
		help: 'Release version filter',
		default: '',
	}
	static UI = {
		title: 'spec',
		help: 'Run spec testing for the active release',
	}

	/**
	 * @param {Partial<SpecCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Release version filter */ this.version
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		yield show(`🛜 nan0release spec ${this.version || 'all'}`)
		const scanner = new Scanner(process.cwd())
		const specs = scanner.findSpecs(this.version)
		if (specs.length === 0) {
			yield show(`No specs found.`, 'warn')
			return result({})
		}
		const files = specs.map((s) => s.path)
		const spawnResult = await runSpawn('node', ['--test', ...files])
		if (spawnResult.code !== 0) {
			throw new Error('Specs failed')
		}
		yield show(`✅ Specs passed`, 'success')
		return result({})
	}
}
