import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import UiAdapter from './UiAdapter.js'
import UiMessage from './Message/Message.js'

describe.skip('UiAdapter', () => {
	it('should create instance', () => {
		const adapter = new UiAdapter()
		assert.ok(adapter)
	})

	it('should start and emit event', (t) => {
		const adapter = new UiAdapter()
		let emitted = false
		adapter.on('input', (msg) => {
			assert.ok(msg instanceof UiMessage)
			emitted = true
		})
		adapter.start()
		setTimeout(() => {
			assert.ok(emitted)
			t.done()
		}, 10)
	})

	it('should have ask method to override', async () => {
		const adapter = new UiAdapter()
		await assert.rejects(async () => await adapter.ask('test'), {
			message: 'ask() method must be implemented in subclass',
		})
	})

	it('should have render method to override', () => {
		const adapter = new UiAdapter()
		assert.throws(() => adapter.render(new UiMessage()), {
			message: /render.*implemented/,
		})
	})

	it('should not throw on start and stop', () => {
		const adapter = new UiAdapter()
		assert.doesNotThrow(() => adapter.start())
		assert.doesNotThrow(() => adapter.stop())
	})
})
