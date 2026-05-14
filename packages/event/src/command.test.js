import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { createCommand } from './command.js'

describe('createCommand()', () => {
	it('createCommand should execute handler and emit success', async () => {
		let beforeCalled = false
		let successCalled = false

		const cmd = createCommand('test', async (ctx) => {
			ctx.data.processed = true
		})

		cmd.on('before', () => {
			beforeCalled = true
		})

		cmd.on('success', () => {
			successCalled = true
		})

		const result = await cmd.execute({ input: 'value' })

		assert.strictEqual(beforeCalled, true)
		assert.strictEqual(successCalled, true)
		assert.strictEqual(result.ok, true)
		assert.deepStrictEqual(result.data, { input: 'value', processed: true })
	})

	it('createCommand should cancel execution if prevented', async () => {
		const cmd = createCommand('test', async (ctx) => {
			if (ctx.data.shouldFail) {
				throw new Error('Should not be called')
			}
			ctx.data.processed = true
			return true
		})

		cmd.on('before', (ctx) => {
			if (ctx.data.shouldCancel) {
				ctx.preventDefault()
			}
		})

		const result = await cmd.execute({ input: 'value', shouldCancel: true })

		assert.strictEqual(result.ok, false)
		assert.strictEqual(result.reason, 'cancelled')
	})

	it('createCommand should handle errors and emit error event', async () => {
		let errorCalled = false
		const cmd = createCommand('test', async () => {
			throw new Error('Test error')
		})

		cmd.on('error', () => {
			errorCalled = true
		})

		const result = await cmd.execute({ input: 'value' })

		assert.strictEqual(errorCalled, true)
		assert.strictEqual(result.ok, false)
		assert.strictEqual(result.error, 'Test error')
	})
})
