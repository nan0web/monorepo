import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Typography from './Typography.js'

describe('Typography theme', () => {
	it('has all variant definitions', () => {
		assert.ok(Typography.variants)
		assert.ok(Typography.variants.h1)
		assert.ok(Typography.variants.h2)
		assert.ok(Typography.variants.h3)
		assert.ok(Typography.variants.h4)
		assert.ok(Typography.variants.h5)
		assert.ok(Typography.variants.h6)
		assert.ok(Typography.variants.body)
		assert.ok(Typography.variants.small)
		assert.ok(Typography.variants.caption)
	})
})
