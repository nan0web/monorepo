import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import App from './App.js'
import DB from '@nan0web/db'

describe('App core functionality', () => {
	it('should construct with default DB and logger', () => {
		const app = new App()
		assert.ok(app.db instanceof DB)
		assert.ok(app.logger)
	})

	it('should expose InputMessage and OutputMessage classes', () => {
		const app = new App()
		assert.ok(app.InputMessage)
		assert.ok(app.OutputMessage)
		assert.equal(app.InputMessage, App.InputMessage)
		assert.equal(app.OutputMessage, App.OutputMessage)
	})

	it('run() should yield an OutputMessage', async () => {
		const app = new App()
		const input = new app.InputMessage({ value: 'test' })
		const gen = app.run(input)
		const { value, done } = await gen.next()
		assert.ok(value instanceof app.OutputMessage)
		assert.equal(done, false)
		const { done: done2 } = await gen.next()
		assert.equal(done2, true)
	})

	it('event bus should emit and receive events', async () => {
		const app = new App()
		let received = null
		app.on('test-event', ({ data }) => {
			received = data
		})
		await app.emit('test-event', { foo: 'bar' })
		assert.deepEqual(received, { foo: 'bar' })
	})
})
