import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Modal from './Modal.js'

describe('Modal theme', () => {
	it('has all required properties defined', () => {
		assert.ok(Modal.overlayBackground)
		assert.ok(Modal.borderRadius)
		assert.ok(Modal.boxShadow)
		assert.ok(Modal.padding)
		assert.ok(Modal.backgroundColor)
	})
})
