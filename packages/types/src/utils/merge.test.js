import { describe, it } from 'node:test'
import assert from 'node:assert'
import merge, { uniqArray } from './merge.js'

describe('merge', () => {
	describe('1. Non-object handling', () => {
		it('returns source when target is not an object', () => {
			const result = merge(42, { a: 1 })
			assert.deepStrictEqual(result, { a: 1 })
		})

		it('returns target when source is not an object', () => {
			const result = merge({ b: 2 }, null)
			assert.deepStrictEqual(result, { b: 2 })
		})
	})

	describe('2. Simple deep merge', () => {
		it('deep merges nested objects', () => {
			const target = { a: { x: 1 }, b: 2 }
			const source = { a: { y: 3 }, c: 4 }
			const expected = { a: { x: 1, y: 3 }, b: 2, c: 4 }
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('3. Array merge – unique (default)', () => {
		it('merges arrays uniquely, handling objects', () => {
			const target = { list: [{ id: 1 }, { id: 2 }] }
			const source = { list: [{ id: 2 }, { id: 3 }] }
			const expected = { list: [{ id: 1 }, { id: 2 }, { id: 3 }] }
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('4. Array merge – non‑unique', () => {
		it('merges arrays preserving duplicates when unique=false', () => {
			const target = { nums: [1, 2] }
			const source = { nums: [2, 3] }
			const expected = { nums: [1, 2, 2, 3] }
			assert.deepStrictEqual(merge(target, source, { unique: false }), expected)
		})
	})

	describe('5. $clear on top‑level array', () => {
		it('clears target array when $clear flag is present', () => {
			const target = { arr: [1, 2] }
			const source = [{ $clear: true }, 3, 4]
			const expected = { arr: [3, 4] }
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('6. $clear on nested array property', () => {
		it('clears nested array when $clear is first element', () => {
			const target = { obj: { data: [5, 6] } }
			const source = { obj: { data: [{ $clear: true }, 7] } }
			const expected = { obj: { data: [7] } }
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('7. $clear on object', () => {
		it('clears target object when $clear flag is present', () => {
			const target = { cfg: { a: 1, b: 2 } }
			const source = { $clear: true }
			const expected = {}
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('8. $clear on object with other keys', () => {
		it('removes $clear but keeps other properties on object', () => {
			const target = { cfg: { a: 1 } }
			const source = { $clear: true, x: 10 }
			const expected = { cfg: { a: 1 }, x: 10 }
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('9. Ignore inherited properties', () => {
		it('does not merge inherited properties', () => {
			const target = { base: { own: 1 } }
			const source = withPrototype()
			const expected = { base: { own: 1 }, own: 'own' }
			assert.deepStrictEqual(merge(target, source), expected)
		})
	})

	describe('merge – additional coverage', () => {
		describe('uniqArray edges', () => {
			it('uniqArray handles primitive duplicates', () => {
				const arr = [1, 2, 1, 'a', 'a']
				const uniq = uniqArray(arr)
				assert.deepStrictEqual(uniq, [1, 2, 'a'])
			})

			it('uniqArray with objects order preserved', () => {
				const arr = [{ id: 1 }, { id: 2 }, { id: 1 }]
				const uniq = uniqArray(arr)
				assert.strictEqual(uniq.length, 2)
				assert.deepStrictEqual(uniq[0], { id: 1 })
				assert.deepStrictEqual(uniq[1], { id: 2 })
			})

			it('uniqArray empty and null', () => {
				const emptyUniq = uniqArray([])
				assert.deepStrictEqual(emptyUniq, [])
				const withNull = uniqArray([null, undefined, null])
				assert.deepStrictEqual(withNull, [null, undefined])
			})
		})
	})
})

/**
 * Helper to create an object with an inherited property.
 */
function withPrototype() {
	const proto = { inherited: 'value' }
	const obj = Object.create(proto)
	obj.own = 'own'
	return obj
}
