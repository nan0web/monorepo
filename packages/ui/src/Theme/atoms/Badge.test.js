import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Badge from './Badge.js'

describe('Badge theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Badge.borderRadius)
		assert.ok(Badge.fontSize)
		assert.ok(Badge.paddingX)
		assert.ok(Badge.paddingY)
		assert.ok(Badge.fontWeight)
		assert.ok(Badge.backgroundColor)
		assert.ok(Badge.color)
	})
})
