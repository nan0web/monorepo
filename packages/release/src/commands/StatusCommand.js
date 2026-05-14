import { OutputMessage } from '@nan0web/co'
import Command from './Command.js'
import process from 'node:process'
import Scanner from '../Release/Scanner.js'

export default class StatusCommand extends Command {
	static name = 'status'
	static help = 'Show release status'

	constructor(input = {}) {
		super(input)
		this.body = {}
	}

	async *run() {
		const scanner = new Scanner(process.cwd())
		const statuses = scanner.status()

		yield new OutputMessage(`🛜 nan0release status`)
		for (const st of statuses) {
			yield new OutputMessage(
				`${st.version.padEnd(10)} | ${st.state.padEnd(6)} | Specs: ${st.specs.length}, Tests: ${st.tests.length}`,
			)
		}
	}
}
