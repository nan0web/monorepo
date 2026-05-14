import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
	oneOf,
	undefinedOr,
	nullOr,
	arrayOf,
	typeOf,
	functionOf,
	empty,
	equal,
	to,
	FullObject,
	UndefinedObject,
	match,
	NonEmptyObject,
	Enum,
	merge,
	clone,
	isConstructible,
} from '../index.js'

describe('nano-types utilities', () => {
	describe('oneOf', () => {
		it('should return value if in list', () => {
			const fn = oneOf('a', 'b', 'c')
			assert.strictEqual(fn('a'), 'a')
			assert.strictEqual(fn('b'), 'b')
			assert.strictEqual(fn('c'), 'c')
		})
		it('should return undefined if not in list', () => {
			const fn = oneOf(1, 2, 3)
			assert.strictEqual(fn(4), undefined)
			assert.strictEqual(fn('1'), undefined)
		})
		it('should work with booleans', () => {
			const fn = oneOf(true, false)
			assert.strictEqual(fn(true), true)
			assert.strictEqual(fn(false), false)
			assert.strictEqual(fn('true'), undefined)
		})
	})

	describe('undefinedOr', () => {
		it('should return undefined if input is undefined', () => {
			const fn = undefinedOr((x) => x * 2)
			assert.strictEqual(fn(undefined), undefined)
		})
		it('should apply function to value', () => {
			const fn = undefinedOr((x) => x * 2)
			assert.strictEqual(fn(5), 10)
		})
		it('should support strings', () => {
			const fn = undefinedOr((x) => x + '!')
			assert.strictEqual(fn('wow'), 'wow!')
		})
	})

	describe('nullOr', () => {
		it('should return null if input is undefined', () => {
			const fn = nullOr((x) => x * 2)
			assert.strictEqual(fn(undefined), null)
		})
		it('should apply function to value', () => {
			const fn = nullOr((x) => x + 1)
			assert.strictEqual(fn(2), 3)
		})
		it('should support boolean logic', () => {
			const fn = nullOr((x) => !x)
			assert.strictEqual(fn(true), false)
		})
	})

	describe('arrayOf', () => {
		it('should map using provided function', () => {
			const fn = arrayOf((x) => x.toUpperCase())
			assert.deepStrictEqual(fn(['a', 'b']), ['A', 'B'])
		})
		it('should use .from if present', () => {
			const fn = arrayOf({ from: (x) => x + 1 })
			assert.deepStrictEqual(fn([1, 2, 3]), [2, 3, 4])
		})
		it('should return empty array if input undefined', () => {
			const fn = arrayOf((x) => x * 2)
			assert.deepStrictEqual(fn(), [])
		})
		it('should handle mixed input types', () => {
			const fn = arrayOf((x) => String(x))
			assert.deepStrictEqual(fn([1, true, null]), ['1', 'true', 'null'])
		})
	})

	describe('typeOf', () => {
		it('should match instance of String', () => {
			const fn = typeOf(String)
			assert.strictEqual(fn(new String('abc')), true)
			assert.strictEqual(fn('abc'), true)
		})
		it('should match instance of Number', () => {
			const fn = typeOf(Number)
			assert.strictEqual(fn(new Number(1)), true)
			assert.strictEqual(fn(1), true)
		})
		it('should match instance of Boolean', () => {
			const fn = typeOf(Boolean)
			assert.strictEqual(fn(new Boolean(true)), true)
			assert.strictEqual(fn(true), true)
		})
		it('should match instance of Number', () => {
			const fn = typeOf(Function)
			assert.strictEqual(fn(Number), true)
			assert.strictEqual(
				fn(() => {}),
				true,
			)
		})
		it('should match instance of custom class', () => {
			class X {}
			const fn = typeOf(X)
			assert.strictEqual(fn(new X()), true)
			assert.strictEqual(fn({}), false)
		})
		it('should handle numbers as not strings', () => {
			const props = [1, 2, 3]
			const fn = typeOf(String)
			assert.strictEqual(fn(props), false)
		})
	})

	describe('functionOf', () => {
		it('should return Boolean for boolean input', () => {
			assert.strictEqual(functionOf(false), Boolean)
		})
		it('should return Boolean for Boolean', () => {
			assert.strictEqual(functionOf(Boolean), Boolean)
		})
		it('should return Number for numeric input', () => {
			assert.strictEqual(functionOf(123), Number)
		})
		it('should return String for string input', () => {
			assert.strictEqual(functionOf('abc'), String)
		})
		it('should return array constructor for array input', () => {
			const fn = functionOf([])
			assert.deepStrictEqual(fn(2), [, ,])
		})
		it('should return constructor for custom object', () => {
			class X {}
			const fn = functionOf(new X())
			assert.ok(fn() instanceof X)
		})
		it('should return undefined for null or non-constructable', () => {
			assert.strictEqual(functionOf(null), undefined)
			assert.strictEqual(functionOf(undefined), undefined)
		})
	})

	describe('empty', () => {
		it('should detect empties', () => {
			assert.ok(empty(undefined))
			assert.ok(empty(null))
			assert.ok(empty(''))
			assert.ok(empty([]))
			assert.ok(empty({}))
		})
		it('should detect more cases', () => {
			class A {}
			class B {
				x = 9
			}
			const a = new A()
			assert.ok(empty(a))
			const b = new B()
			b.x = 3
			assert.ok(!empty(b))
			assert.strictEqual(JSON.stringify(b), '{"x":3}')
			assert.ok(!empty(1))
			assert.ok(!empty(Infinity))
			assert.ok(!empty(-Infinity))
			assert.ok(!empty(NaN))
			assert.ok(!empty(['']))
			assert.ok(!empty([undefined]))
			assert.ok(!empty({ x: 0 }))
		})
	})

	describe('equal', () => {
		it('returns true for pairs that are strictly equal', () => {
			assert.ok(equal(1, 1, 'a', 'a', true, true))
		})

		it('returns false if any pair is not strictly equal', () => {
			assert.ok(!equal(1, 1, 'a', 'b', true, true))
			assert.ok(!equal(0, false))
			assert.ok(!equal(null, undefined))
		})

		it('throws TypeError if number of arguments is zero', () => {
			assert.throws(() => equal(), TypeError)
			assert.throws(() => equal(1), {
				message: [
					'Only paired arguments are allowed',
					'equal(x, true, y, false, z, 0) => x === true && y === false && z === 0',
				].join('\n'),
			})
		})

		it('throws TypeError if number of arguments is odd', () => {
			assert.throws(() => equal(1, 1, 2), TypeError)
			assert.throws(() => equal('x', true, 'y'), /Only paired arguments are allowed/)
		})

		it('works correctly with undefined values', () => {
			assert.ok(equal(undefined, undefined, null, null))
			assert.ok(!equal(undefined, 1))
		})

		it('works with mixed types', () => {
			assert.ok(equal(0, 0, '', '', false, false))
			assert.ok(!equal(0, '0'))
		})

		it('works with arrays', () => {
			assert.ok(equal([1, 2, 3], [1, 2, 3]))
			assert.ok(!equal([1, 2, 3], [1, 2, 4]))
		})

		it('works with objects', () => {
			assert.ok(equal({ a: 1, b: 2 }, { a: 1, b: 2 }))
			assert.ok(!equal({ a: 1, b: 2 }, { a: 1, b: 3 }))
		})

		it('works with nested arrays', () => {
			assert.ok(equal([1, [2, 3]], [1, [2, 3]]))
			assert.ok(!equal([1, [2, 3]], [1, [2, 4]]))
		})

		it('works with nested objects', () => {
			assert.ok(equal({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }))
			assert.ok(!equal({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } }))
		})

		it('works with instances', () => {
			class A {
				x = 9
			}
			class B extends A {
				get y() {
					return this.x ** 2
				}
				fn() {}
			}
			class C extends A {
				y = 3
			}
			const a = new A()
			const b = new B()
			const c = new C()
			assert.ok(equal(a, a))
			assert.ok(equal(a, b))
			assert.ok(equal(b, b))
			assert.ok(!equal(a, c))
		})
	})

	describe('to', () => {
		it('should transforms class instance into Object', () => {
			class A {
				x = 9
			}
			class B extends A {
				get y() {
					return this.x ** 2
				}
				fn() {}
			}
			const a = to(Object)(new A())
			const b = to(Object)(new B())
			assert.deepStrictEqual(a, { x: 9 })
			assert.deepStrictEqual(b, { x: 9 })
		})
		it('should transforms class instance into FullObject', () => {
			class A {
				x = 9
			}
			class B extends A {
				get y() {
					return this.x ** 2
				}
				fn() {}
			}
			class C extends B {
				toObject() {
					return { x: this.x, y: this.y, c: 'ψ' }
				}
			}
			class E {
				get a() {
					return new A()
				}
				get b() {
					return new B()
				}
			}
			const a = to(FullObject)(new A())
			const b = to(FullObject)(new B())
			const c = to(Object)(new C())
			const d = to(FullObject)(new C())
			const e = to(FullObject)(new E())
			assert.deepStrictEqual(a, { x: 9 })
			assert.deepStrictEqual(b, { x: 9, y: 81 })
			assert.deepStrictEqual(c, { x: 9, y: 81, c: 'ψ' })
			assert.deepStrictEqual(d, { x: 9, y: 81, c: 'ψ' })
			assert.deepStrictEqual(e, { a: { x: 9 }, b: { x: 9, y: 81 } })
		})
		it('should ignore undefined values', () => {
			const a = to(Object)({ x: 9, y: undefined })
			assert.deepStrictEqual(a, { x: 9 })
		})
		it('should include undefined values for UndefinedObject', () => {
			const data = { x: 9, y: undefined }
			const a = to(Object)(data)
			assert.strictEqual(JSON.stringify(a), '{"x":9}')
		})
		it('should include undefined values for UndefinedObject', () => {
			const data = { x: 9, y: undefined }
			const b = to(UndefinedObject)(data)
			// For UndefinedObject we preserve undefined values
			assert.ok(b.x !== undefined)
			assert.ok(b.y === undefined)
		})

		it('should convert nested objects', () => {
			const input = {
				a: { b: { c: 1, d: undefined }, e: 2 },
				f: 3,
			}
			const result = to(Object)(input)
			assert.deepStrictEqual(result, {
				a: { b: { c: 1 }, e: 2 },
				f: 3,
			})
		})

		it('should convert nested arrays', () => {
			const input = [1, [2, [3, undefined]], 4]
			const result = to(Array)(input)
			assert.deepStrictEqual(result, [1, [2, [3, undefined]], 4])
		})

		it('should convert nested maps', () => {
			const innerMap = new Map([['z', 99]])
			const map = new Map([
				['a', 1],
				['b', innerMap],
			])
			const result = to(Map)(map)
			assert.ok(result instanceof Map)
			assert.strictEqual(result.get('a'), 1)
			assert.ok(result.get('b') instanceof Map)
			assert.strictEqual(result.get('b').get('z'), 99)
		})

		it('should convert nested sets', () => {
			const innerSet = new Set([2, 3])
			const set = new Set([1, innerSet])
			const result = to(Set)(set)
			assert.ok(result instanceof Set)
			const arr = Array.from(result)
			assert.strictEqual(arr[0], 1)
			assert.ok(arr[1] instanceof Set)
			assert.deepStrictEqual(Array.from(arr[1]), [2, 3])
		})

		it('should convert deeply nested mixed structures', () => {
			class A {
				constructor() {
					this.x = 1
				}
			}
			const input = {
				arr: [new A(), { y: 2, z: [3, undefined] }],
				a: new A(),
			}
			const result = to(Object)(input)
			assert.deepStrictEqual(result, {
				arr: [{ x: 1 }, { y: 2, z: [3, undefined] }],
				a: { x: 1 },
			})
		})

		it('should convert to NonEmptyObject undefined', () => {
			const input = { x: 9, y: undefined }
			const result = to(NonEmptyObject)(input)
			assert.deepStrictEqual(result, { x: 9 })
		})
		it('should not convert to NonEmptyObject empty string', () => {
			const input = { x: 9, y: '' }
			const result = to(Object)(to(NonEmptyObject)(input))
			assert.deepStrictEqual(result, { x: 9 })
		})

		it('should convert boolean', () => {
			assert.equal(to('boolean')(9), true)
			assert.equal(to('boolean')({}), true)
			assert.equal(to('boolean')(1), true)
			assert.equal(to('boolean')(0), false)
			assert.equal(to('boolean')(''), false)
			assert.equal(to('boolean')(null), false)
			assert.equal(to(Boolean)(9), true)
			assert.equal(to(Boolean)({}), true)
			assert.equal(to(Boolean)(1), true)
			assert.equal(to(Boolean)(0), false)
			assert.equal(to(Boolean)(''), false)
			assert.equal(to(Boolean)(null), false)
		})

		it('should convert number', () => {
			assert.equal(to('number')(9), 9)
			assert.equal(to('number')({}), NaN)
			assert.equal(to('number')(1), 1)
			assert.equal(to('number')(0), 0)
			assert.equal(to('number')('3'), 3)
			assert.equal(to('number')(null), 0)
			assert.equal(to('number')(), 0)
			assert.equal(to(Number)(9), 9)
			assert.equal(to(Number)({}), NaN)
			assert.equal(to(Number)(1), 1)
			assert.equal(to(Number)(0), 0)
			assert.equal(to(Number)('3'), 3)
			assert.equal(to(Number)(null), 0)
			assert.equal(to(Number)(), 0)
		})

		it('should convert number', () => {
			class A {
				name = ''
				constructor(name) {
					this.name = String(name)
				}
				toString() {
					return `<${this.name}>`
				}
			}
			assert.equal(to('string')(9), '9')
			assert.equal(to('string')({}), '[object Object]')
			assert.equal(to('string')(new A(1)), '<1>')
			assert.equal(to('string')(0), '0')
			assert.equal(to('string')('3'), '3')
			assert.equal(to('string')(null), 'null')
			assert.equal(to('string')(), 'undefined')
			assert.equal(to(String)(9), '9')
			assert.equal(to(String)({}), '[object Object]')
			assert.equal(to(String)(new A(3)), '<3>')
			assert.equal(to(String)(0), '0')
			assert.equal(to(String)('3'), '3')
			assert.equal(to(String)(null), 'null')
			assert.equal(to(String)(), 'undefined')
		})
	})

	describe('match', () => {
		it('should match strings', () => {
			const fn = match('hello')
			assert.ok(fn('hello'))
			assert.ok(!fn('world'))
		})
		it('should match strings case-insensitively', () => {
			const fn = match('hello', { caseInsensitive: true })
			assert.ok(fn('hello'))
			assert.ok(!fn('world'))
			assert.ok(fn('HELLO'))
		})
		it('should match regex', () => {
			const fn = match(/^hello$/)
			assert.ok(fn('hello'))
			assert.ok(!fn('world'))
		})
		it('should match regex case-insensitively', () => {
			const fn = match(/^hello$/, { caseInsensitive: true })
			assert.ok(fn('hello'))
			assert.ok(!fn('world'))
			assert.ok(fn('HELLO'))
		})
		it('should match multiple values', () => {
			const fn = match('hello')
			assert.ok(fn('hello', 'world'))
			assert.ok(!fn('HELLO', 'WORLD'))
		})
		it('should match multiple values with every', () => {
			const fn = match('hello', { method: 'every', caseInsensitive: true })
			assert.ok(!fn('hello', 'world'))
			assert.ok(!fn('HELLO', 'WORLD'))
			assert.ok(fn('hello', 'Hello'))
		})
		it('should match multiple values case-insensitively', () => {
			const fn = match('l', { caseInsensitive: true, stringFn: 'includes' })
			assert.ok(fn('hello', 'world'))
			assert.ok(fn('HELLO', 'WORLD'))
		})
		it('should match multiple values case-insensitively', () => {
			const fn = match('he', { caseInsensitive: true, method: 'every', stringFn: 'startsWith' })
			assert.ok(fn('hello', 'hemp'))
			assert.ok(fn('hello', 'HEmp'))
			assert.ok(!fn('HELLO', 'WORLD'))
		})
	})

	describe('Enum', () => {
		it('should validate single values from allowed list', () => {
			const validator = Enum('red', 'green', 'blue')
			assert.strictEqual(validator('red'), 'red')
			assert.strictEqual(validator('green'), 'green')
			assert.strictEqual(validator('blue'), 'blue')
		})

		it('should validate array values from allowed list', () => {
			const validator = Enum(1, 2, 3)
			assert.deepStrictEqual(validator([1, 2]), [1, 2])
			assert.deepStrictEqual(validator([3, 1, 2]), [3, 1, 2])
		})

		it('should throw error for invalid single value', () => {
			const validator = Enum('red', 'green', 'blue')
			assert.throws(() => validator('yellow'), {
				name: 'TypeError',
				message: [
					'Enumeration must have one value of',
					'- red',
					'- green',
					'- blue',
					'but provided',
					'yellow',
				].join('\n'),
			})
		})

		it('should throw error for invalid array value', () => {
			const validator = Enum(1, 2, 3)
			assert.throws(() => validator([1, 4]), {
				name: 'TypeError',
				message: [
					'Enumeration must have one value of',
					'- 1',
					'- 2',
					'- 3',
					'but provided',
					4,
				].join('\n'),
			})
		})

		it('should validate with custom functions', () => {
			const isString = (value) => typeof value === 'string'
			const validator = Enum('red', 'green', isString)
			assert.strictEqual(validator('red'), 'red')
			assert.strictEqual(validator('orange'), 'orange')
			assert.strictEqual(validator('purple'), 'purple')
		})

		it("should throw error when value doesn't match any enum or function", () => {
			const isString = (value) => typeof value === 'string'
			const validator = Enum('red', 'green', isString)
			let caught
			try {
				validator(123)
			} catch (e) {
				caught = e
			}
			assert.ok(caught instanceof TypeError)
			assert.ok(caught.message.includes('- red'))
			assert.ok(caught.message.includes('- green'))
			assert.ok(caught.message.includes('but provided'))
			assert.ok(caught.message.includes('123'))
		})

		it('should validate arrays with custom functions', () => {
			const isNumber = (value) => typeof value === 'number'
			const validator = Enum('red', isNumber)
			assert.deepStrictEqual(validator(['red', 1, 2]), ['red', 1, 2])
			assert.deepStrictEqual(validator([3, 4]), [3, 4])
		})

		it('should throw error for arrays with invalid values', () => {
			const isNumber = (value) => typeof value === 'number'
			const validator = Enum('red', isNumber)
			let caught
			try {
				validator(['red', 'blue'])
			} catch (e) {
				caught = e
			}
			assert.ok(caught instanceof TypeError)
			assert.ok(caught.message.includes('- red'))
			assert.ok(caught.message.includes('but provided'))
			assert.ok(caught.message.includes('blue'))
		})
	})

	describe('merge', () => {
		it('should be defined, all the tests are in other suite', () => {
			assert.ok('function' === typeof merge)
		})
	})

	describe('clone', () => {
		it('should be defined, all the tests are in other suite', () => {
			assert.ok('function' === typeof clone)
		})
	})

	describe('isConstructible()', () => {
		const fnNope = () => {}
		class Yes {}

		assert.ok(!isConstructible(fnNope))
		assert.ok(isConstructible(Yes))
		assert.ok(!isConstructible(''))
		assert.ok(isConstructible(String))
	})
})
