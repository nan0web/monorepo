import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Input from './Input.js'

describe('Input theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Input.borderRadius)
		assert.ok(Input.borderWidth)
		assert.ok(Input.borderColor)
		assert.ok(Input.fontSize)
		assert.ok(Input.paddingX)
		assert.ok(Input.paddingY)
		assert.ok(Input.fontFamily)
	})
})
