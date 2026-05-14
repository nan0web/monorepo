import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'
import resolveValidation from './resolveValidation.js'
import ModelError from '../domain/ModelError.js'
import { createT } from './TFunction.js'

describe('resolveValidation', () => {
	it('resolveValidation should pass when all validations return true', () => {
		class Model {
			static name = { validate: (val) => val !== undefined }
			static age = { validate: (val) => val >= 18 }
		}

		const obj = { name: 'Test', age: 20 }

		// Should not throw
		const result = resolveValidation(Model, obj)
		assert.equal(result, true)
	})

	it('resolveValidation should throw a ModelError containing validation strings', () => {
		class Model {
			static name = { validate: (val) => (val ? true : 'Name is required') }
			static age = { validate: (val) => (val >= 18 ? true : 'Must be 18 or older') }
		}

		const obj = { age: 10 }

		let caughtError = null
		try {
			resolveValidation(Model, obj)
		} catch (err) {
			caughtError = err
		}

		assert.ok(caughtError instanceof ModelError)
		assert.equal(caughtError.fields.name, 'Name is required')
		assert.equal(caughtError.fields.age, 'Must be 18 or older')
		assert.equal(caughtError.message.includes('\n---\n'), true)
	})

	it('resolveValidation should handle false return value as generic error', () => {
		class Model {
			static token = { validate: (val) => val === 'MAGIC' }
		}

		const obj = { token: 'WRONG' }

		let caughtError = null
		try {
			resolveValidation(Model, obj)
		} catch (err) {
			caughtError = err
		}

		assert.ok(caughtError instanceof ModelError)
		assert.deepEqual(caughtError.fields.token, [
			"Validation failed for property '{key}'",
			{ key: 'token' },
		])

		// Basic translation test
		const t = (key, params) => {
			if (key === "Validation failed for property '{key}'") {
				return `Помилка валідації властивості '${params.key}'`
			}
			return key
		}
		const translated = caughtError.translate(t)
		assert.equal(translated.fields.token, "Помилка валідації властивості 'token'")

		// Real createT test
		const translated2 = caughtError.translate(
			createT({
				"Validation failed for property '{key}'": "Помилка валідації властивості '{key}'",
			}),
		)
		assert.equal(translated2.fields.token, "Помилка валідації властивості 'token'")
	})
})
