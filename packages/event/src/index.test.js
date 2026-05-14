import { test } from 'node:test'
import * as assert from 'node:assert'
import event from './index.js'

test('event() should return memory adapter in non-browser non-node env', async (t) => {
	const bus = event()
	let receivedData

	bus.on('test', (ctx) => {
		receivedData = ctx.data
	})

	await bus.emit('test', { key: 'value' })

	assert.deepStrictEqual(receivedData, { key: 'value' })
})

test('event() should prevent default in memory adapter', async (t) => {
	const bus = event()
	let callCount = 0

	bus.on('test', (ctx) => {
		callCount++
		ctx.preventDefault()
	})

	bus.on('test', (ctx) => {
		callCount++
	})

	const result = await bus.emit('test', { key: 'value' })

	assert.strictEqual(result.defaultPrevented, true)
	assert.strictEqual(callCount, 1)
})
