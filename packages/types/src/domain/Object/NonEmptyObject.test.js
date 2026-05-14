import { describe, it } from 'node:test'
import assert from 'node:assert'
import { notEmpty } from '../../utils/core.js'
import NonEmptyObject from './NonEmptyObject.js'

describe('NonEmptyObject', () => {
	describe('Basic functionality', () => {
		class TestModel extends NonEmptyObject {
			name = 'Olena'
			age = 0
			email = ''
			address = null
		}

		it('converts to object skipping empty values', () => {
			const instance = new TestModel()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, { name: 'Olena', age: 0 })
		})

		it('skips all empty types: "", null, undefined, {}', () => {
			class TestEmpty extends NonEmptyObject {
				strEmpty = ''
				numZero = 0
				objEmpty = {}
				arrEmpty = []
				valNull = null
				valUndefined = undefined
				nonEmpty = 'value'
			}
			const instance = new TestEmpty()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, { numZero: 0, nonEmpty: 'value' })
		})

		it('includes non-empty primitives', () => {
			class TestPrimitives extends NonEmptyObject {
				str = 'hello'
				num = 42
				boolTrue = true
				arr = [1, 2]
			}
			const instance = new TestPrimitives()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, {
				str: 'hello',
				num: 42,
				boolTrue: true,
				arr: [1, 2],
			})
		})

		it('handles inherited properties correctly – skips non-own', () => {
			class Base extends NonEmptyObject {
				baseProp = 'base'
			}
			class Derived extends Base {
				derivedEmpty = ''
				derivedProp = 'derived'
			}
			const instance = new Derived()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, {
				baseProp: 'base',
				derivedProp: 'derived',
			})
		})
	})

	describe('Nested objects', () => {
		class NestedEmpty extends NonEmptyObject {
			innerEmpty = {}
		}
		class NestedNonEmpty extends NonEmptyObject {
			value = 'nested'
		}

		it('recursively calls toObject on nested NonEmptyObject instances', () => {
			class TestNested extends NonEmptyObject {
				nestedFull = new NestedNonEmpty()
				nestedEmpty = new NestedEmpty()
				primitive = 'outer'
			}
			const instance = new TestNested()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, {
				nestedFull: { value: 'nested' },
				primitive: 'outer',
			})
		})

		it('handles deeply nested structures', () => {
			class B extends NonEmptyObject {
				c = ''
			}
			class DeepA extends NonEmptyObject {
				a = { b: new B() }
				d = 'deep'
			}
			const instance = new DeepA()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, { d: 'deep' })
		})

		it('skips nested if toObject returns empty object', () => {
			class TestSkipNested extends NonEmptyObject {
				nested = new (class Nested extends NonEmptyObject {
					emptyStr = ''
				})()
			}
			const instance = new TestSkipNested()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, {})
		})
	})

	describe('Edge cases with empty/notEmpty', () => {
		it('handles undefined properties', () => {
			class TestUndef extends NonEmptyObject {
				defined = 'ok'
			}
			const instance = new TestUndef()
			instance.undefinedProp = undefined
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, { defined: 'ok' })
		})

		it('works with arrays of nested objects', () => {
			class Item extends NonEmptyObject {
				val = 'item1'
			}
			class EmptyItem extends NonEmptyObject {
				empty = ''
			}
			class TestArray extends NonEmptyObject {
				items = [new Item(), new EmptyItem()]
			}
			const instance = new TestArray()
			const obj = instance.toObject()
			assert.deepStrictEqual(obj, {
				items: [{ val: 'item1' }],
			})
		})
	})
})
