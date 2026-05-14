import { describe, it } from 'node:test'
import assert from 'node:assert'
import UpdateInfoMessage from './UpdateInfoMessage.js'

describe('UpdateInfoMessage', () => {
	it('should create instance with default values', () => {
		const message = new UpdateInfoMessage()
		assert.strictEqual(message.head.authorization, '')
		assert.strictEqual(message.body.username, '')
		assert.strictEqual(message.body.firstName, '')
		assert.strictEqual(message.body.lastName, '')
		assert.strictEqual(message.body.gender, -1)
	})

	it('should create instance with provided values', () => {
		const message = new UpdateInfoMessage({
			head: {
				authorization: 'Bearer token123',
			},
			body: {
				username: 'testuser',
				firstName: 'John',
				lastName: 'Doe',
				gender: 1,
			},
		})
		assert.strictEqual(message.head.authorization, 'Bearer token123')
		assert.strictEqual(message.body.username, 'testuser')
		assert.strictEqual(message.body.firstName, 'John')
		assert.strictEqual(message.body.lastName, 'Doe')
		assert.strictEqual(message.body.gender, 1)
	})

	it('should convert values to proper types', () => {
		const message = new UpdateInfoMessage({
			body: {
				username: 123,
				firstName: 456,
				lastName: 789,
				gender: '1',
			},
		})
		assert.strictEqual(message.body.username, '123')
		assert.strictEqual(message.body.firstName, '456')
		assert.strictEqual(message.body.lastName, '789')
		assert.strictEqual(message.body.gender, 1)
	})

	it('from method should return same instance if already UpdateInfoMessage', () => {
		const original = new UpdateInfoMessage()
		const result = UpdateInfoMessage.from(original)
		assert.strictEqual(result, original)
	})

	it('from method should create new instance from plain object', () => {
		const input = {
			head: {
				authorization: 'Bearer test',
			},
			body: {
				username: 'user1',
				firstName: 'Jane',
				lastName: 'Smith',
				gender: 2,
			},
		}
		const result = UpdateInfoMessage.from(input)
		assert.ok(result instanceof UpdateInfoMessage)
		assert.strictEqual(result.head.authorization, 'Bearer test')
		assert.strictEqual(result.body.username, 'user1')
		assert.strictEqual(result.body.firstName, 'Jane')
		assert.strictEqual(result.body.lastName, 'Smith')
		assert.strictEqual(result.body.gender, 2)
	})
})
