import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import resolveDefaults from '../../../../../utils/resolveDefaults.js'

describe('resolveDefaults', () => {
	it('should apply default values when target property is undefined', () => {
		class TestModel {
			static name = { default: 'Anonymous' }
			static age = { default: 18 }
		}

		const target = {}
		resolveDefaults(TestModel, target)

		assert.equal(target.name, 'Anonymous')
		assert.equal(target.age, 18)
	})

	it('should NOT overwrite existing values with defaults', () => {
		class TestModel {
			static name = { default: 'Anonymous' }
		}

		const target = { name: 'John' }
		resolveDefaults(TestModel, target)

		assert.equal(target.name, 'John')
	})

	it('should infer expectedType from default value', () => {
		class TestModel {
			static age = { default: 18 } // inferred type: number
		}

		const target = { age: '25' }
		resolveDefaults(TestModel, target)

		assert.strictEqual(target.age, 25)
		assert.strictEqual(typeof target.age, 'number')
	})

	it('should use explicit type from metadata', () => {
		class TestModel {
			static count = { type: 'number' }
		}

		const target = { count: '42' }
		resolveDefaults(TestModel, target)

		assert.strictEqual(target.count, 42)
	})

	it('should normalize string values', () => {
		class TestModel {
			static id = { type: 'string' }
		}

		const target = { id: 123 }
		resolveDefaults(TestModel, target)

		assert.strictEqual(target.id, '123')
	})

	it('should normalize boolean values (basic)', () => {
		class TestModel {
			static active = { type: 'boolean' }
		}

		const target1 = { active: 1 }
		const target2 = { active: 0 }
		const target3 = { active: '' }

		resolveDefaults(TestModel, target1)
		resolveDefaults(TestModel, target2)
		resolveDefaults(TestModel, target3)

		assert.strictEqual(target1.active, true)
		assert.strictEqual(target2.active, false)
		assert.strictEqual(target3.active, false)
	})

	it('should normalize boolean values from "true"/"false" strings', () => {
		class TestModel {
			static active = { type: 'boolean' }
		}

		const targetT = { active: 'true' }
		const targetF = { active: 'false' }

		resolveDefaults(TestModel, targetT)
		resolveDefaults(TestModel, targetF)

		assert.strictEqual(targetT.active, true)
		assert.strictEqual(targetF.active, false)
	})

	it('should ignore non-object static properties', () => {
		class TestModel {
			static someProp = 'not-a-meta'
		}

		const target = { someProp: 'existing' }
		resolveDefaults(TestModel, target)

		assert.equal(target.someProp, 'existing')
	})

	it('should handle target values being null or undefined for normalization', () => {
		class TestModel {
			static count = { type: 'number', default: 0 }
		}

		const target1 = { count: undefined }
		const target2 = { count: null }

		resolveDefaults(TestModel, target1)
		resolveDefaults(TestModel, target2)

		assert.strictEqual(target1.count, 0, 'Should apply default if undefined')
		assert.strictEqual(target2.count, null, 'Should NOT apply default if null')
	})

	it('should NOT normalize if value is null even if type is specified', () => {
		class TestModel {
			static name = { type: 'string' }
		}

		const target = { name: null }
		resolveDefaults(TestModel, target)

		assert.strictEqual(target.name, null, 'null should remain null')
	})

	it('should handle empty strings for numbers', () => {
		class TestModel {
			static count = { type: 'number' }
		}

		const target = { count: '' }
		resolveDefaults(TestModel, target)

		assert.strictEqual(target.count, 0, 'Empty string should become 0 for number type')
	})

	it('should handle "0" and "1" for booleans if type is boolean', () => {
		class TestModel {
			static active = { type: 'boolean' }
		}

		const target0 = { active: '0' }
		const target1 = { active: '1' }

		resolveDefaults(TestModel, target0)
		resolveDefaults(TestModel, target1)

		assert.strictEqual(target0.active, false, "'0' string should become false")
		assert.strictEqual(target1.active, true, "'1' string should become true")
	})
})
