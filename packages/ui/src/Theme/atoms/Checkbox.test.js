import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Checkbox from './Checkbox.js'

describe('Checkbox theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Checkbox.size)
		assert.ok(Checkbox.borderColor)
		assert.ok(Checkbox.borderRadius)
		assert.ok(Checkbox.borderWidth)
		assert.ok(Checkbox.backgroundColor)
		assert.ok(Checkbox.checkedColor)
	})
})
