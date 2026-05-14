import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Card from './Card.js'

describe('Card theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Card.borderRadius)
		assert.ok(Card.boxShadow)
		assert.ok(Card.padding)
		assert.ok(Card.backgroundColor)
		assert.ok(Card.borderColor)
	})
})
