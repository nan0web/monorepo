import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import clone from './clone.js'

/**
 * Helper class with explicit .clone() method.
 */
class WithClone {
	constructor(value) {
		this.value = value
	}
	clone() {
		const c = new WithClone(this.value)
		// ensure any future properties are also cloned via generic mechanism
		Object.keys(this).forEach((k) => {
			if (k !== 'value') c[k] = clone(this[k])
		})
		return c
	}
}

/**
 * Helper class without .clone() – relies on constructor cloning.
 */
class WithoutClone {
	constructor(data) {
		this.data = data
	}
}

describe('clone', () => {
	/* 1. Primitive values are returned as‑is */
	it('clone returns primitives unchanged', () => {
		assert.strictEqual(clone(null), null)
		assert.strictEqual(clone(undefined), undefined)
		assert.strictEqual(clone(42), 42)
		assert.strictEqual(clone('nan0'), 'nan0')
		assert.strictEqual(clone(true), true)
	})

	/* 2. Plain objects are deeply cloned */
	it('deep clone of plain objects', () => {
		const original = { a: 1, b: { c: 2 } }
		const copy = clone(original)

		assert.deepStrictEqual(copy, original)
		assert.notStrictEqual(copy, original)
		assert.notStrictEqual(copy.b, original.b)

		// mutate copy should not affect original
		copy.b.c = 99
		assert.strictEqual(original.b.c, 2)
	})

	/* 3. Arrays keep non‑numeric properties */
	it('clone array with extra properties', () => {
		const original = [1, 2, 3]
		original.foo = { bar: 'baz' }

		const copy = clone(original)

		assert.deepStrictEqual(copy, original)
		assert.notStrictEqual(copy, original)
		assert.strictEqual(copy.foo.bar, 'baz')

		// mutation check
		copy.foo.bar = 'qux'
		assert.strictEqual(original.foo.bar, 'baz')
	})

	/* 4. Circular references are preserved */
	it('clone handles circular references', () => {
		const original = { name: 'circle' }
		original.self = original

		const copy = clone(original)

		assert.notStrictEqual(copy, original)
		assert.strictEqual(copy.name, 'circle')
		assert.strictEqual(copy.self, copy) // circular link points to clone itself
	})

	/* 5. Objects with .clone() method use it */
	it('clone respects custom .clone() method', () => {
		const original = new WithClone('magic')
		original.extra = { deep: [1, 2, 3] }

		const copy = clone(original)

		assert.ok(copy instanceof WithClone)
		assert.strictEqual(copy.value, 'magic')
		assert.deepStrictEqual(copy.extra, original.extra)
		assert.notStrictEqual(copy.extra, original.extra)

		// mutation safety
		copy.extra.deep.push(4)
		assert.deepStrictEqual(original.extra.deep, [1, 2, 3])
	})

	/* 6. Custom class without .clone() is instantiated via constructor */
	it('clone custom class without .clone()', () => {
		const original = new WithoutClone({ key: 'val' })
		const copy = clone(original)

		assert.ok(copy instanceof WithoutClone)
		assert.deepStrictEqual(copy.data, original.data)
		assert.notStrictEqual(copy.data, original.data)

		// mutation safety
		copy.data.key = 'changed'
		assert.strictEqual(original.data.key, 'val')
	})
})
