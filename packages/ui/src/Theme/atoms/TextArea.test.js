import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import TextArea from './TextArea.js'
import Input from './Input.js'

describe('TextArea theme', () => {
	it('inherits all properties from Input', () => {
		assert.equal(TextArea.borderRadius, Input.borderRadius)
		assert.equal(TextArea.borderWidth, Input.borderWidth)
		assert.equal(TextArea.borderColor, Input.borderColor)
		assert.equal(TextArea.fontSize, Input.fontSize)
		assert.equal(TextArea.paddingX, Input.paddingX)
		assert.equal(TextArea.paddingY, Input.paddingY)
		assert.equal(TextArea.fontFamily, Input.fontFamily)
	})

	it('has its own height property', () => {
		assert.ok(TextArea.height)
	})
})
