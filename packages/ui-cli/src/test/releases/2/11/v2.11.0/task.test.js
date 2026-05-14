import test from 'node:test'
import assert from 'node:assert/strict'
import { bootstrapApp } from '../../../../../../src/ui/bootstrapApp.js'

test('bootstrapApp should be an async function', () => {
	assert.equal(typeof bootstrapApp, 'function')
})

test('bootstrapApp handles model and argv successfully', async (t) => {
	class TestModel {
		static help = 'Test Help'
		static name = { type: 'string', help: 'Your name', alias: 'n' }
		
		constructor(data) {
			this.data = data
		}

		async* run() {
			yield { type: 'log', message: `Hello ${this.data.name}` }
			return { status: 'success' }
		}
	}

	const result = await bootstrapApp(TestModel, { 
		argv: ['--name', 'Antigravity'],
		t: (k) => k,
		root: '.test_data',
		noExit: true
	})

	assert.strictEqual(result.success, true, 'Should succeed')
	assert.strictEqual(result.cancelled, false, 'Should not be cancelled')
})

	test('bootstrapApp handles failure with exit code 1', async (t) => {
		class FailModel {
			constructor() {}
			async* run() {
				throw new Error('Expected Failure')
			}
		}

		const err = console.error
		console.error = () => {}
		try {
			await bootstrapApp(FailModel, { 
				argv: [],
				t: (k) => k,
				root: '.test_data',
				noExit: true
			})
			assert.fail('Should have thrown')
		} catch (e) {
			assert.strictEqual(/** @type {Error} */ (e).message, 'Expected Failure')
		} finally {
			console.error = err
		}
	})
