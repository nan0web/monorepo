import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import OutputMessage from './OutputMessage.js'

describe('OutputMessage', () => {
	it('should create instance with default values', () => {
		const msg = new OutputMessage()
		assert.ok(msg instanceof OutputMessage)
		assert.deepEqual(msg.body, [])
		assert.deepEqual(msg.meta, {})
		assert.equal(msg.error, null)
		assert.equal(msg.priority, OutputMessage.PRIORITY.NORMAL)
	})

	it('should create instance with custom values', () => {
		const props = {
			content: ['test content'],
			meta: { key: 'value' },
			error: new Error('test error'),
			priority: OutputMessage.PRIORITY.HIGH,
		}
		const msg = new OutputMessage(props)
		assert.deepEqual(msg.content, ['test content'])
		assert.deepEqual(msg.meta, { key: 'value' })
		assert.ok(msg.error instanceof Error)
		assert.equal(msg.priority, OutputMessage.PRIORITY.HIGH)
	})

	it('should set type based on error presence', () => {
		const errorMsg = new OutputMessage({ error: 'error occurred' })
		const infoMsg = new OutputMessage({ content: ['info'] })
		assert.equal(errorMsg.type, 'error')
		assert.equal(infoMsg.type, 'info')
	})

	it('should handle string content', () => {
		const msg = new OutputMessage({ content: 'single string' })
		assert.deepEqual(msg.content, ['single string'])
	})

	it('should combine messages', () => {
		const msg1 = new OutputMessage({ content: ['part1'], priority: 1 })
		const msg2 = new OutputMessage({ content: ['part2'], priority: 2 })
		const combined = msg1.combine(msg2)
		assert.deepEqual(combined.content, ['part1', 'part2'])
		assert.equal(combined.priority, 2)
	})

	it('should convert to JSON', () => {
		const msg = new OutputMessage({
			content: ['test'],
			meta: { test: true },
			error: new Error('test error'),
		})
		const json = msg.toJSON()
		assert.ok(json.body)
		assert.ok(json.meta)
		assert.ok(json.error)
		assert.ok(json.time)
	})
})
