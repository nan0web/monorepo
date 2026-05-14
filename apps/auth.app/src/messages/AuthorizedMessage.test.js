import { describe, it } from 'node:test'
import assert from 'node:assert'
import AuthorizedMessage from './AuthorizedMessage.js'

describe('AuthorizedMessage', () => {
	it('should create instance with default values', () => {
		const message = new AuthorizedMessage()
		assert.strictEqual(message.head.authorization, '')
	})

	it('should create instance with provided authorization', () => {
		const message = new AuthorizedMessage({
			head: {
				authorization: 'Bearer token123',
			},
		})
		assert.strictEqual(message.head.authorization, 'Bearer token123')
	})

	it('should handle null head gracefully', () => {
		const message = new AuthorizedMessage({
			head: null,
		})
		assert.strictEqual(message.head.authorization, '')
	})

	it('should convert authorization to string', () => {
		const message = new AuthorizedMessage({
			head: {
				authorization: 12345,
			},
		})
		assert.strictEqual(message.head.authorization, '12345')
	})

	it('from method should return same instance if already AuthorizedMessage', () => {
		const original = new AuthorizedMessage()
		const result = AuthorizedMessage.from(original)
		assert.strictEqual(result, original)
	})

	it('from method should create new instance from plain object', () => {
		const input = {
			head: {
				authorization: 'Bearer test',
			},
		}
		const result = AuthorizedMessage.from(input)
		assert.ok(result instanceof AuthorizedMessage)
		assert.strictEqual(result.head.authorization, 'Bearer test')
	})
})
