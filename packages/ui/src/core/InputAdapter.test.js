import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import InputAdapter from './InputAdapter.js'

describe('InputAdapter', () => {
	it('should create instance', () => {
		const adapter = new InputAdapter()
		assert.ok(adapter instanceof InputAdapter)
	})

	it('should start and emit input message', () => {
		const adapter = new InputAdapter()
		let emitted = false
		let message = null

		adapter.on('input', (msg) => {
			emitted = true
			message = msg
		})

		adapter.start()
		assert.ok(emitted)
		assert.ok(message)
	})

	it('should stop without error', () => {
		const adapter = new InputAdapter()
		assert.doesNotThrow(() => adapter.stop())
	})

	it('should be ready by default', () => {
		const adapter = new InputAdapter()
		assert.ok(adapter.isReady())
	})

	it('should throw on unimplemented ask method', async () => {
		const adapter = new InputAdapter()
		await assert.rejects(adapter.ask('Question?'), {
			message: 'ask() method must be implemented in subclass',
		})
	})

	it('should throw on unimplemented select method', async () => {
		const adapter = new InputAdapter()
		await assert.rejects(adapter.select({}), {
			message: 'select() method must be implemented in subclass',
		})
	})

	it('should have CancelError static property', () => {
		assert.ok(InputAdapter.CancelError)
		const error = new InputAdapter.CancelError()
		assert.equal(error.name, 'CancelError')
		assert.equal(error.message, 'Operation cancelled by user')
	})
})
