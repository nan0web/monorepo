import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Avatar from './Avatar.js'

describe('Avatar theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Avatar.size)
		assert.ok(Avatar.borderRadius)
		assert.ok(Avatar.border)
	})
})
