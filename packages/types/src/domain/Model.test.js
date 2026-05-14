import { describe, it } from 'node:test'
import assert from 'assert/strict'
import { Model } from './Model.js'

describe('Model', () => {
	it('should initialize with data', () => {
		class User extends Model {
			static name = { default: 'Anonymous' }
			static age = { alias: 'user_age' }
		}

		const user = new User({ user_age: 30 })
		assert.strictEqual(user.name, 'Anonymous')
		assert.strictEqual(user.age, 30)
		assert.strictEqual(user._.db, null)
		assert.ok('function' === typeof user._.t)
		assert.deepStrictEqual(user._.plugins, {})
	})

	it('should provide access to options via _', () => {
		const db = { find: () => {} }
		const model = new Model({}, { db, other: 'opt' })

		assert.strictEqual(model._.db, db)
		assert.strictEqual(model._.other, 'opt')
	})

	it('should validate against schema', () => {
		class Product extends Model {
			static price = {
				errorPositive: 'Price must be positive',
				validate: (v) => v > 0 || Product.price.errorPositive,
			}
		}

		const valid = new Product({ price: 10 })
		assert.strictEqual(valid.validate(), true)

		const invalid = new Product({ price: -1 })
		assert.throws(() => invalid.validate(), /Price must be positive/)
	})
})
