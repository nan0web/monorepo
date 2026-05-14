import { describe, it } from 'node:test'
import assert from 'node:assert'
import { to, FullObject, Enum, isConstructible } from '../index.js'

describe('core – edge coverage', () => {
	it('to(Map) preserves nested maps (covers Map handling)', () => {
		const inner = new Map([['k2', 2]])
		const outer = new Map([['k1', inner]])
		const result = to(Map)(outer)
		assert.ok(result instanceof Map)
		const innerResult = result.get('k1')
		assert.ok(innerResult instanceof Map)
		assert.strictEqual(innerResult.get('k2'), 2)
	})

	it('to(Set) preserves nested sets (covers Set handling)', () => {
		const inner = new Set([2, 3])
		const outer = new Set([1, inner])
		const result = to(Set)(outer)
		assert.ok(result instanceof Set)
		const values = Array.from(result)
		assert.strictEqual(values[0], 1)
		assert.ok(values[1] instanceof Set)
		assert.deepStrictEqual(Array.from(values[1]), [2, 3])
	})

	it('to(FullObject) skips getter errors gracefully', () => {
		class BadGetter {
			get explode() {
				throw new Error('boom')
			}
			get ok() {
				return 42
			}
		}
		const obj = to(FullObject)(new BadGetter())
		assert.deepStrictEqual(obj, { ok: 42 })
	})

	it('Enum validates with function and throws on bad value (covers error path)', () => {
		const isNumber = (v) => typeof v === 'number'
		const validator = Enum('red', isNumber)

		// valid cases
		assert.strictEqual(validator('red'), 'red')
		assert.strictEqual(validator(10), 10)

		// invalid case should throw
		let caught
		try {
			validator('blue')
		} catch (e) {
			caught = e
		}
		assert.ok(caught instanceof TypeError)
		assert.ok(caught.message.includes('Enumeration must have one value of'))
		assert.ok(caught.message.includes('- red'))
		assert.ok(caught.message.includes('but provided'))
		assert.ok(caught.message.includes('blue'))
	})

	it('isConstructible distinguishes class vs arrow function (covers lines 270‑271)', () => {
		const Arrow = () => {}
		class Klass {}

		assert.ok(isConstructible(Klass))
		assert.ok(!isConstructible(Arrow))
	})
})
