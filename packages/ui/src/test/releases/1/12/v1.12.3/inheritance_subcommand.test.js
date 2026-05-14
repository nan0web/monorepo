import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ModelAsApp } from '../../../../../domain/ModelAsApp.js'

describe('v1.12.3: Inheritance and Subcommand Parameter "Punch-through"', () => {
	it('should correctly propagate and cast arguments in nested subcommands', async () => {
		class AuditorBase extends ModelAsApp {
			static timeout = { type: 'number', default: 30 }
		}

		class SpecificAuditor extends AuditorBase {
			static name = { default: 'Specific' }
			static alias = 'specific'
		}

		class InspectApp extends ModelAsApp {
			static auditors = {
				positional: true,
				options: [SpecificAuditor]
			}
		}

		// Simulate CLI data: root gets timeout flag and auditor positional
		const data = {
			auditors: 'specific',
			timeout: '3' // String from CLI
		}

		const app = new InspectApp(data)

		// Verification
		assert.ok(app.auditors instanceof SpecificAuditor, 'Subcommand should be instantiated')
		assert.strictEqual(app.timeout, '3', 'Root app should have the raw string timeout (no metadata in root)')
		
		// The "Punch-through" check
		assert.strictEqual(typeof app.auditors.timeout, 'number', 'Subcommand timeout should be cast to number')
		assert.strictEqual(app.auditors.timeout, 3, 'Subcommand timeout should be 3, not the default 30')
	})

	it('should handle deeply nested subcommands with inherited parameters', async () => {
		class LeafCommand extends ModelAsApp {
			static timeout = { type: 'number', default: 30 }
		}

		class MidCommand extends ModelAsApp {
			static leaf = {
				positional: true,
				options: [LeafCommand]
			}
		}

		class RootApp extends ModelAsApp {
			static mid = {
				positional: true,
				options: [MidCommand]
			}
		}

		const data = {
			mid: 'mid',
			leaf: 'leaf',
			timeout: '7'
		}

		const app = new RootApp(data)

		assert.ok(app.mid instanceof MidCommand)
		assert.ok(app.mid.leaf instanceof LeafCommand)
		assert.strictEqual(app.mid.leaf.timeout, 7, 'Deeply nested subcommand should receive the timeout')
	})

	it('should propagate arguments when manually instantiating subcommands in run()', async () => {
		class SubAuditor extends ModelAsApp {
			static timeout = { type: 'number', default: 30 }
			async *run() {
				yield { type: 'result', data: { timeout: this.timeout } }
			}
		}

		class Orchestrator extends ModelAsApp {
			static timeout = { type: 'number', default: 30 }
			async *run() {
				// Simulate the fix: pass own data (via destructuring) to the child
				const { _, ...data } = this
				const sub = new SubAuditor({ ...data, dir: '.' }, _)
				
				yield* sub.run()
			}
		}

		const data = { timeout: '5' }
		const app = new Orchestrator(data)
		
		const gen = app.run()
		const res = await gen.next()
		assert.strictEqual(res.value.data.timeout, 5, 'Manually instantiated subcommand should receive the timeout')
	})
})
