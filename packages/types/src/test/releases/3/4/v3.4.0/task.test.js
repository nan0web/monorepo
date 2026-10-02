import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Format } from '../../../../../domain/Format.js'
import { Model } from '../../../../../domain/Model.js'

describe('Release v3.4.0: Base Format Model Contract', () => {
	it('inherits from Model', () => {
		const fmt = new Format()
		assert.ok(fmt instanceof Model)
		assert.ok(fmt instanceof Format)
	})

	it('provides default stringify, parse, validate methods', () => {
		const fmt = new Format()
		assert.strictEqual(fmt.stringify('hello'), 'hello')
		assert.strictEqual(fmt.stringify(null), '')
		assert.strictEqual(fmt.stringify(undefined), '')
		assert.strictEqual(fmt.parse('any'), 'any')
		assert.strictEqual(fmt.validate('any'), true)
	})
})
