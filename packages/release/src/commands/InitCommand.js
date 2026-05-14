import { OutputMessage } from '@nan0web/co'
import Command from './Command.js'
import process from 'node:process'

class InitBody {
	static version = { help: 'Release version', defaultValue: '' }
	/** @type {string} */
	version = ''
	constructor({ version = '' } = {}) {
		this.version = String(version)
	}
}

export default class InitCommand extends Command {
	static name = 'init'
	static help = 'Initialize a new release structure'
	static Body = InitBody

	/** @param {Partial<Command> & { body?: Partial<InitBody> }} [input={}] */
	constructor(input = {}) {
		super(input)
		this.body = new InitBody(/** @type {*} */ (input))
	}

	async *run() {
		let v = this.body.version
		if (!v) {
			throw new Error('Version is required (e.g. --version=1.0.0 or --version=v1.0.0)')
		}
		if (!v.startsWith('v')) v = 'v' + v

		const parts = v.replace('v', '').split('.')
		const major = parts[0] || '0'
		const minor = parts[1] || '0'

		const { mkdirSync, writeFileSync } = await import('node:fs')
		const { join } = await import('node:path')

		const dir = join(process.cwd(), 'releases', major, minor, v)
		mkdirSync(dir, { recursive: true })

		const taskPath = join(dir, 'task.md')
		writeFileSync(taskPath, `# Release ${v}\n\n- [ ] Task 1`, 'utf8')

		const specPath = join(dir, 'test.spec.js')
		writeFileSync(
			specPath,
			`import test from 'node:test'\nimport assert from 'node:assert'\n\ntest('Sample spec', () => {\n\tassert.ok(true)\n})\n`,
			'utf8',
		)

		yield new OutputMessage({
			content: [`✅ Initialized release ${v} in ${dir}`],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}
}
