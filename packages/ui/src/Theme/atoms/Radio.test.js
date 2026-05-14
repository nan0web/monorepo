import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Radio from './Radio.js'

describe('Radio theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Radio.size)
		assert.ok(Radio.borderColor)
		assert.ok(Radio.borderRadius)
		assert.ok(Radio.borderWidth)
		assert.ok(Radio.backgroundColor)
		assert.ok(Radio.checkedColor)
	})
})
