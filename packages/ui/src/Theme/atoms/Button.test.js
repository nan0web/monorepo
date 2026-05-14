import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Button from './Button.js'
import Input from './Input.js'

describe('Button theme', () => {
	it('inherits properties from Input', () => {
		assert.equal(Button.borderRadius, Input.borderRadius)
		assert.equal(Button.borderWidth, Input.borderWidth)
		assert.equal(Button.borderColor, Input.borderColor)
		assert.equal(Button.fontSize, Input.fontSize)
		assert.equal(Button.paddingX, Input.paddingX)
		assert.equal(Button.paddingY, Input.paddingY)
	})

	it('has its own properties', () => {
		assert.ok(Button.color)
		assert.ok(Button.background)
		assert.ok(Button.hoverBackground)
		assert.ok(Button.shadow)
	})
})
