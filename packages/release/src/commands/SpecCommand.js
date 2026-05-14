import { OutputMessage } from '@nan0web/co'
import Command from './Command.js'
import process from 'node:process'
import Scanner from '../Release/Scanner.js'

class SpecBody {
	static version = { help: 'Release version filter', defaultValue: '' }
	/** @type {string} */
	version = ''
	constructor({ version = '' } = {}) {
		this.version = String(version)
	}
}

export default class SpecCommand extends Command {
	static name = 'spec'
	static help = 'Run spec testing for the active release'
	static Body = SpecBody

	/** @param {Partial<Command> & { body?: Partial<SpecBody> }} [input={}] */
	constructor(input = {}) {
		super(input)
		this.body = new SpecBody(/** @type {*} */ (input))
	}

	async *run() {
		yield new OutputMessage(`🛜 nan0release spec ${this.body.version || 'all'}`)
		const scanner = new Scanner(process.cwd())
		const specs = scanner.findSpecs(this.body.version)
		if (specs.length === 0) {
			yield new OutputMessage(`No specs found.`)
			return
		}
		const files = specs.map((s) => s.path)
		await this._run('node', ['--test', ...files], 'Specs failed')
		yield new OutputMessage({
			content: [`✅ Specs passed`],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}
}
