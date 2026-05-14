import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import resolveDefaults from '../../../../../utils/resolveDefaults.js'
import { Model } from '../../../../../domain/Model.js'

describe('v1.7.6: Inheritance-Aware Metadata Protocol & Normalization', () => {
	it('should inherit metadata from parent classes', () => {
		class Parent {
			static timeout = { type: 'number', default: 30 }
			static dir = { default: '.' }
			static overridableField = { default: 'original' }
		}
		class Child extends Parent {
			static name = { default: 'Child' }
			static overridableField = { default: 'overridden' }
		}

		const data = {}
		const resolved = resolveDefaults(Child, data)

		assert.strictEqual(resolved.timeout, 30, 'Should inherit timeout from Parent')
		assert.strictEqual(resolved.dir, '.', 'Should inherit dir from Parent')
		assert.strictEqual(resolved.name, 'Child', 'Should support name field even if it is a reserved static property')
		assert.strictEqual(resolved.overridableField, 'overridden', 'Child should override Parent')
	})

	it('should normalize boolean values from "0" and "1"', () => {
		class TestModel {
			static active = { type: 'boolean' }
		}

		const data0 = { active: '0' }
		const data1 = { active: '1' }

		resolveDefaults(TestModel, data0)
		resolveDefaults(TestModel, data1)

		assert.strictEqual(data0.active, false, "'0' should be false")
		assert.strictEqual(data1.active, true, "'1' should be true")
	})

	it('should normalize numeric values from empty strings', () => {
		class TestModel {
			static timeout = { type: 'number' }
		}

		const data = { timeout: '' }
		resolveDefaults(TestModel, data)

		assert.strictEqual(data.timeout, 0, "'' should be 0 for numbers")
	})

	it('Model class should use resolveDefaults correctly in constructor', () => {
		class MyModel extends Model {
			static timeout = { type: 'number', default: 30 }
		}

		const instance = new MyModel({ timeout: '45' })
		assert.strictEqual(instance.timeout, 45, 'Should cast input data to number')
		assert.strictEqual(typeof instance.timeout, 'number')
	})
})
