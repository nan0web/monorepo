import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import I from './I.js'

describe('I', () => {
	it('should create instance with string value', () => {
		const identity = new I('test')
		assert.equal(identity.value, 'test')
	})

	it('should convert to string', () => {
		const identity = new I('test')
		assert.equal(String(identity), 'test')
	})

	it('should handle non-string values', () => {
		const identity = new I(123)
		assert.equal(identity.value, '123')
		assert.equal(String(identity), '123')
	})

	it('should return same instance from from() if already I', () => {
		const identity = new I('test')
		const result = I.from(identity)
		assert.strictEqual(result, identity)
	})

	it('should create new instance from from() if not I', () => {
		const result = I.from('test')
		assert.ok(result instanceof I)
		assert.equal(result.value, 'test')
	})
})
