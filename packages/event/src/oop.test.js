import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Event from './oop.js'

describe('Event (oop)', () => {
	it('Event class should emit and listen to events', async (t) => {
		class TestEvent extends Event {}
		const instance = new TestEvent()
		let receivedData

		instance.on('test-event', (ctx) => {
			receivedData = ctx.data
		})

		await instance.emit('test-event', { value: 'hello' })

		assert.deepStrictEqual(receivedData, { value: 'hello' })
	})

	it('Event class should prevent default when context flag is set', async (t) => {
		class TestEvent extends Event {}
		const instance = new TestEvent()
		let callCount = 0

		instance.on('test-event', (ctx) => {
			callCount++
			ctx.preventDefault()
		})

		instance.on('test-event', (ctx) => {
			callCount++
		})

		const result = await instance.emit('test-event', { value: 'hello' })

		assert.strictEqual(result.defaultPrevented, true)
		assert.strictEqual(callCount, 1)
	})
})
