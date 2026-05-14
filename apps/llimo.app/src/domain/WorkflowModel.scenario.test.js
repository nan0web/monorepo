import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { WorkflowModel } from './WorkflowModel.js'

describe('WorkflowModel OLMUI Scenario', () => {

	async function runGenerator(generator, handlers) {
		let next = await generator.next()
		while (!next.done) {
			const intent = next.value
			let response = undefined

			if (intent.type === 'ask' && handlers.ask) {
				response = await handlers.ask(intent)
			} else if (intent.type === 'log' && handlers.log) {
				handlers.log(intent)
			} else if (intent.type === 'progress' && handlers.progress) {
				handlers.progress(intent)
			}

			next = await generator.next(response)
		}
		return next.value
	}

	const mockT = (key, params = {}) => {
		let s = key
		for (const [k, v] of Object.entries(params)) {
			s = s.replace(`{${k}}`, v)
		}
		return s
	}

	test('1. Full workflow execution with DB fetching and command delegation', async () => {
		const mockDB = {
			fetch: async (path) => {
				if (path === 'test.md') {
					return `- @bash echo "hello world"\n- @llimo index`
				}
				throw new Error('Not found')
			},
			stat: async (path) => {
				if (path === 'package.json') return { exists: true }
				return { exists: false }
			},
			saveDocument: async () => {} // Mock save usage.csv
		}

		const model = new WorkflowModel({ filename: 'test.md' }, /** @type {any} */ ({ db: mockDB, t: mockT }))

		const events = []
		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				events.push(`asked:${intent.command} ${intent.args.join(' ')}`)
				// Mock command execution success
				return { status: 'ok', exitCode: 0, stdout: 'simulated output' }
			},
			log: (intent) => events.push(`log:${intent.level}`),
			progress: (intent) => events.push(`progress:${intent.message}`)
		})

        console.dir(data, { depth: null })
        console.dir(events, { depth: null })

		assert.equal(data.type, 'result')
		assert.equal(data.data.status, 'ok')
		assert.ok(data.data.duration !== undefined)

		// Verification
		assert.equal(events[0], 'progress:Workflow initialization: test.md')
		assert.equal(events[1], 'progress:Processing step: @bash echo "hello world"')
		assert.equal(events[2], 'asked:echo "hello world"') // @bash unwraps command
		assert.equal(events[3], 'log:success') // Success log for step 1
		assert.equal(events[4], 'progress:Processing step: @llimo index')
		assert.equal(events[5], 'asked:npm run index') // registry auto-detected and unwraps command
		assert.equal(events[6], 'log:success') // Success log for step 2
		assert.equal(events[7], 'log:success') // Final workflow success log
	})

	test('2. Workflow fails gracefully on security violation', async () => {
		const mockDB = {
			fetch: async () => `- @bash sudo rm -rf /`,
			stat: async () => ({ exists: false }),
			saveDocument: async () => {}
		}

		const model = new WorkflowModel({ filename: 'malicious.md' }, /** @type {any} */ ({ db: mockDB, t: mockT }))

		const events = []
		const data = await runGenerator(model.run(), {
			log: (intent) => events.push(`log:${intent.level}:${intent.message}`)
		})

		assert.equal(data.type, 'result')
		assert.equal(data.data.status, 'failed')
		assert.equal(data.data.reason, 'security_violation')

		assert.ok(events[0].includes('log:error:Security Violation'))
	})
})
