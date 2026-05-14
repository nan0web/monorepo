import G0d from './G0d.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('G0d basic functionality', (t) => {
	const god = new G0d()

	assert.equal(god.is, true, 'G0d existence should be true')
	assert.equal(god.isnt, false, 'G0d non-existence should be false')
})
