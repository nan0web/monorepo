import process from 'node:process'

import { OutputMessage } from '@nan0web/co'
import Command from './Command.js'
import Scanner from '../Release/Scanner.js'

class CloseBody {
	static version = { help: 'Release version', defaultValue: '' }
	/** @type {string} */
	version = ''
	constructor({ version = '' } = {}) {
		this.version = String(version)
	}
}

export default class CloseCommand extends Command {
	static name = 'close'
	static help = 'Close a release and move tests to src/'
	static Body = CloseBody

	/** @param {Partial<Command> & { body?: Partial<CloseBody> }} [input={}] */
	constructor(input = {}) {
		super(input)
		this.body = new CloseBody(/** @type {*} */ (input))
	}

	async *run() {
		const v = this.body.version || ''

		yield new OutputMessage(`🛜 nan0release close ${v || 'all'}`)

		const scanner = new Scanner(process.cwd())
		const specs = scanner.findSpecs(v)

		if (specs.length === 0) {
			yield new OutputMessage(`No pending specs found for version ${v || 'all'}`)
			return
		}

		yield new OutputMessage(`Running ${specs.length} pending specs...`)

		const files = specs.map((s) => s.path)
		await this._run('node', ['--test', ...files], 'Cannot close: Specs failed')

		yield new OutputMessage(`✅ Specs passed. Closing...`)

		let movedCount = 0
		const { renameSync, mkdirSync } = await import('node:fs')
		const { join, dirname } = await import('node:path')

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

		yield new OutputMessage({
			content: [`✅ Successfully closed ${movedCount} specs and moved to src/releases/`],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}
}
