import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ModelAsApp } from './ModelAsApp.js'
import { runGenerator, show, result } from '../index.js'
import DB from '@nan0web/db'

// ─── 1. Mock Models for Testing ───

class SubCommand extends ModelAsApp {
	static UI = { title: 'Sub Logic' }
	static alias = 'sub'
	static timeout = {
		help: 'Timeout to cancel',
		default: 333,
	}
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} Timeout to cancel */ this.timeout
	}
	async *run() {
		yield show('Sub running')
		return result({ ok: true, timeout: this.timeout })
	}
}

/**
 * @property {SubCommand} command
 * @property {boolean} help
 */
class RootApp extends ModelAsApp {
	static alias = 'root'
	static UI = { title: 'Root App' }
	static command = {
		help: 'Target command',
		options: [SubCommand],
		positional: true,
	}
	static debug = {
		help: 'Debug mode',
		type: 'boolean',
		default: false,
	}
}

// ─── 2. User Stories ───

describe('ModelAsApp User Stories', () => {
	it('Story: Universal Help - renders sorted and inherited options', async () => {
		const app = new RootApp()
		const help = app.generateHelp()
		assert.deepStrictEqual(help.split('\n'), [
			'# Root App',
			'',
			'## Usage:',
			'```bash',
			'root [command] [options]',
			'root sub   — Sub Logic',
			'```',
			'',
			'## Arguments:',
			'```bash',
			'  command   - Target command',
			'```',
			'',
			'## Options:',
			'```bash',
			'  --debug   - Debug mode [false]',
			'  --help    - Show help',
			'```',
			'',
		])
	})

	it('Story: Subcommand Auto-Routing - instantiates subcommand from string', async () => {
		const app = new RootApp({ command: 'sub' })
		const cmd = /** @type {any} */ (app).command
		assert.ok(cmd instanceof SubCommand, 'Should auto-instantiate SubCommand')
		assert.equal(cmd._.parentPath, 'root', 'Should inject parentPath')
	})

	it('Story: Subcommand Help - delegates help to subcommand if requested', async () => {
		// Simulating "root sub --help"
		const app = new RootApp({ command: 'sub', help: true })
		const cmd = /** @type {any} */ (app).command
		// In this case, root.command is instantiated and has help: true
		assert.ok(cmd.help, 'Subcommand should have help: true')

		const helpText = app.generateHelp()
		assert.ok(helpText.includes('# Sub Logic'), 'Should show subcommand help')
		assert.ok(helpText.includes('Usage:'), 'Should have usage')
		assert.ok(helpText.includes('root sub'), 'Should have correct command path')
	})

	it('Story: Positional Mapping - resolves positionals into model fields', async () => {
		const db = new DB()
		await db.connect()

		// We use execute to run without real UI
		const res = await RootApp.execute({ command: 'sub', timeout: '3' }, { db })
		assert.deepEqual(res, { ok: true, timeout: 3 }, 'Should execute subcommand and return result')
		assert.equal(res.timeout, 3)
	})

	it('Story: OLMUI Lifecycle - flows through runGenerator handlers', async () => {
		const app = new RootApp({ command: 'sub' })
		const events = []

		const data = await runGenerator(app.run(), {
			ask: async () => ({ value: {}, cancelled: false }),
			show: (i) => { events.push(`show:${i.message || i}`) },
			result: (i) => i.data,
		})

		assert.equal(events[0], 'show:Sub running', 'Should capture show intent from subcommand')
		assert.deepEqual(data, { ok: true, timeout: 333 }, 'Should capture final result')
	})
})
