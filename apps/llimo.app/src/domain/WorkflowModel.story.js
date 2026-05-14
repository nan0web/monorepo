import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { WorkflowModel } from './WorkflowModel.js'

describe('Workflow: Agnostic Pipelines (@llimo)', () => {
	it('should translate @llimo test into "pnpm test" when package.json exists', async () => {
		const db = new DB({
			predefined: [
				['package.json', '{}'],
				['workflow.md', '- @llimo test'],
			],
		})
		await db.connect()

		const wf = /** @type {any} */ (new WorkflowModel({ filename: 'workflow.md' }, { db }))
		let cmdExecuted = ''

		await /** @type {any} */(runGenerator)(wf.run(), {
			progress: () => {},
			log: () => {},
			ask: async (intent) => {
				if (intent.field === 'execute_step') {
					cmdExecuted = intent.command
					return { status: 'ok', exitCode: 0 }
				}
			}
		})

		assert.equal(cmdExecuted, 'pnpm')
	})

	it('should translate @llimo test into "cargo test" when Cargo.toml exists', async () => {
		const db = new DB({
			predefined: [
				['Cargo.toml', '[package]'],
				['workflow.md', '- @llimo test'],
			],
		})
		await db.connect()

		const wf = /** @type {any} */ (new WorkflowModel({ filename: 'workflow.md' }, { db }))
		let cmdExecuted = ''

		await /** @type {any} */(runGenerator)(wf.run(), {
			progress: () => {},
			log: () => {},
			ask: async (intent) => {
				if (intent.field === 'execute_step') {
					cmdExecuted = intent.command
					return { status: 'ok', exitCode: 0 }
				}
			}
		})

		assert.equal(cmdExecuted, 'cargo')
	})
})

describe('Workflow: Security Gate', () => {
	it('should block dangerous "rm -rf /" command', async () => {
		const db = new DB({
			predefined: [['dangerous.md', '- @bash rm -rf /']],
		})
		await db.connect()

		const wf = /** @type {any} */ (new WorkflowModel({ filename: 'dangerous.md' }, { db }))
		const result = await /** @type {any} */(runGenerator)(wf.run(), {
			progress: () => {},
			log: () => {},
		})

		assert.equal(result.data.status, 'failed')
		assert.equal(result.data.reason, 'security_violation')
	})
})

describe('Workflow: Analytics', () => {
	it('should save usage.csv to DB after successful execution', async () => {
		const db = new DB({
			predefined: [['work.md', '- @bash ls']],
		})
		await db.connect()

		const wf = /** @type {any} */ (new WorkflowModel({ filename: 'work.md' }, { db }))
		await /** @type {any} */(runGenerator)(wf.run(), {
			progress: () => {},
			log: () => {},
			ask: async (intent) => {
				if (intent.field === 'execute_step') {
					return { status: 'ok', exitCode: 0 }
				}
			}
		})

		const usage = await db.get('usage.csv')
		assert.ok(usage.includes('ls,Success'))
	})
})
