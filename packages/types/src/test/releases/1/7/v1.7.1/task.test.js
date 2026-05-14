import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Model, resolveAliases } from '../../../../../index.js'

describe('Release v1.7.1 — Model Refinement', () => {
	it('db is NOT a built-in getter (no shadowing)', () => {
		class MyModel extends Model {
			static db = { default: 'sqlite' }
		}
		const m = new MyModel({ db: 'postgres' })
		assert.strictEqual(m.db, 'postgres')
	})

	it('db defaults from schema when not provided', () => {
		class MyModel extends Model {
			static db = { default: 'sqlite' }
		}
		const m = new MyModel({})
		assert.strictEqual(m.db, 'sqlite')
	})

	it('options accessed via _ getter', () => {
		const db = { find: () => {} }
		const t = (k) => k
		const m = new Model({}, { db, t })
		assert.strictEqual(m._.db, db)
		assert.strictEqual(m._.t, t)
	})

	it('string shorthand: new Model("text") → { UI: "text" }', () => {
		const m = new Model('hello')
		assert.strictEqual(m.UI, 'hello')
	})

	it('setData() with alias resolution and chaining', () => {
		class Config extends Model {
			static appName = { alias: 'name' }
		}
		const c = new Config({})
		const result = c.setData({ name: 'my-app' })
		assert.strictEqual(c.appName, 'my-app')
		assert.strictEqual(result, c) // chaining
	})

	it('resolveAliases supports array aliases', () => {
		class Config {
			static appName = { alias: ['name', 'n'] }
		}
		const r1 = resolveAliases(Config, { name: 'a' })
		assert.strictEqual(r1.appName, 'a')
		assert.strictEqual(r1.name, undefined)

		const r2 = resolveAliases(Config, { n: 'b' })
		assert.strictEqual(r2.appName, 'b')
		assert.strictEqual(r2.n, undefined)
	})

	it('ModelOptions typedef: t is accessible', () => {
		const t = (key) => `[${key}]`
		const m = new Model({}, { t })
		assert.strictEqual(m._.t('hello'), '[hello]')
	})
})
