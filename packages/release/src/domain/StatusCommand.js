import { ModelAsApp, result, show } from '@nan0web/ui'
import Scanner from '../Release/Scanner.js'

export default class StatusCommand extends ModelAsApp {
	static UI = {
		title: 'status',
		help: 'Show release status',
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const scanner = new Scanner(process.cwd())
		const statuses = scanner.status()

		yield show(`🛜 nan0release status`)
		for (const st of statuses) {
			yield show(
				`${st.version.padEnd(10)} | ${st.state.padEnd(6)} | Specs: ${st.specs.length}, Tests: ${st.tests.length}`,
			)
		}
		return result({})
	}
}
