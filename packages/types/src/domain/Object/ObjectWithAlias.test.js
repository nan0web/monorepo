import { describe, it } from 'node:test'
import assert from 'node:assert'
import ObjectWithAlias from './ObjectWithAlias.js'

describe('ObjectWithAlias', () => {
	describe('Basic instantiation', () => {
		class TestAlias extends ObjectWithAlias {
			static ALIAS = { aliasName: 'name', aliasAge: 'age' }
		}

		it('instantiates with empty constructor', () => {
			const instance = new TestAlias()
			assert.ok(instance instanceof ObjectWithAlias)
			assert.ok(instance instanceof TestAlias)
		})

		it('static from returns existing instance', () => {
			const instance = new TestAlias({ name: 'test' })
			const from = TestAlias.from(instance)
			assert.strictEqual(from, instance)
		})

		it('static from maps aliases correctly', () => {
			const props = { aliasName: 'Olena', aliasAge: 32 }
			const instance = TestAlias.from(props)
			assert.strictEqual(instance.name, 'Olena')
			assert.strictEqual(instance.age, 32)
			assert.strictEqual(instance.aliasName, undefined)
			assert.strictEqual(instance.aliasAge, undefined)
		})

		it('static from handles mixed props with aliases', () => {
			const props = { name: 'Direct', aliasAge: 25 }
			const instance = TestAlias.from(props)
			assert.strictEqual(instance.name, 'Direct')
			assert.strictEqual(instance.age, 25)
		})

		it('static from ignores undefined aliases', () => {
			const props = { aliasName: undefined, other: 'keep' }
			const instance = TestAlias.from(props)
			assert.strictEqual(instance.name, undefined)
			assert.strictEqual(instance.other, 'keep')
		})
	})

	describe('Extended usage and edge cases', () => {
		it('allows overriding static from in extensions', () => {
			class CustomFrom extends ObjectWithAlias {
				static ALIAS = { custom: 'standard' }
				static from(props = {}) {
					return new this({ ...props, extra: 'added' })
				}
				constructor(input) {
					super(input)
					this.value = input.extra || ''
				}
			}
			const result = CustomFrom.from({ custom: 'val' })
			assert.strictEqual(result.value, 'added')
			assert.strictEqual(result.standard, undefined)
		})

		it('handles empty ALIAS map', () => {
			class NoAlias extends ObjectWithAlias {
				static ALIAS = {}
				constructor(input) {
					super(input)
					this.prop = input.prop || ''
				}
			}
			const instance = NoAlias.from({ prop: 'value', extra: 'ignored' })
			assert.strictEqual(instance.prop, 'value')
		})

		it('processes multiple aliases', () => {
			class MultiAlias extends ObjectWithAlias {
				static ALIAS = {
					shortName: 'name',
					shortAge: 'age',
					shortEmail: 'email',
				}
			}
			const props = { shortName: 'Ali', shortAge: 30, other: 'keep' }
			const instance = MultiAlias.from(props)
			assert.deepStrictEqual(
				{
					name: 'Ali',
					age: 30,
					email: undefined,
					other: 'keep',
				},
				{
					name: instance.name,
					age: instance.age,
					email: instance.email,
					other: instance.other,
				},
			)
		})

		it('from works with non-object input', () => {
			class SafeAlias extends ObjectWithAlias {
				static ALIAS = { key: 'val' }
			}
			const result = SafeAlias.from(null)
			assert.ok(result instanceof SafeAlias)
			assert.deepStrictEqual(result.constructor.ALIAS, { key: 'val' })
		})
	})
})
