import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from './Model.js'
import { ProjectModel } from './ProjectModel.js'
import { ModelError } from '@nan0web/types'

describe('Model', () => {
	it('creates instance with default values', () => {
		const m = new Model()
		assert.ok(m instanceof Model)
	})

	it('accepts data in constructor', () => {
		const m = new Model({ foo: 'bar' })
		assert.equal(m.foo, 'bar')
	})

	it('exposes db from options via _', () => {
		const fakeDb = { fetch: () => {} }
		const m = new Model({}, { db: fakeDb })
		assert.equal(m._.db, fakeDb)
	})

	it('exposes _ (options) accessor', () => {
		const opts = { db: null, extra: 42 }
		const m = new Model({}, opts)
		assert.equal(m._.extra, 42)
	})

	it('validates using static schema metadata via validate()', () => {
		class UserModel extends Model {
			static email = {
				errorInvalid: 'Invalid email',
				validate: (val) => (typeof val === 'string' && val.includes('@')) || UserModel.email.errorInvalid,
			}
		}

		const validUser = new UserModel({ email: 'test@example.com' })
		assert.equal(validUser.validate(), true)

		const invalidUser = new UserModel({ email: 'bad' })
		assert.throws(
			() => invalidUser.validate(),
			(err) => {
				assert.ok(err instanceof ModelError)
				assert.equal(err.fields.email, 'Invalid email')
				return true
			}
		)
	})
})

describe('ProjectModel', () => {
	it('extends Model', () => {
		const p = new ProjectModel()
		assert.ok(p instanceof Model)
		assert.ok(p instanceof ProjectModel)
	})

	it('has Model-as-Schema static metadata', () => {
		assert.equal(typeof ProjectModel.description.help, 'string')
		assert.equal(ProjectModel.description.default, '')
		assert.equal(typeof ProjectModel.tags.help, 'string')
		assert.deepEqual(ProjectModel.tags.default, [])
	})

	it('creates instance with defaults', () => {
		const p = new ProjectModel()
		assert.equal(p.description, '')
		assert.deepEqual(p.tags, [])
		assert.equal(p.locale, 'uk')
		assert.deepEqual(p.i18n, [])
		assert.equal(p.status, 'planned')
	})

	it('accepts data and overrides defaults', () => {
		const p = new ProjectModel({
			description: 'My App',
			tags: ['ui', 'cli'],
			locale: 'en',
			status: 'active',
		})
		assert.equal(p.description, 'My App')
		assert.deepEqual(p.tags, ['ui', 'cli'])
		assert.equal(p.locale, 'en')
		assert.equal(p.status, 'active')
	})

	it('parses comma-separated tags string', () => {
		const p = new ProjectModel({ tags: 'ui, core, cli' })
		assert.deepEqual(p.tags, ['ui', 'core', 'cli'])
	})

	it('has UI metadata', () => {
		assert.equal(ProjectModel.UI.title, 'Project Data')
	})

	it('validates status correctly', () => {
		const valid = new ProjectModel({ status: 'active' })
		assert.equal(valid.validate(), true)

		const invalid = new ProjectModel({ status: 'unknown' })
		assert.throws(() => invalid.validate(), (err) => {
			assert.ok(err instanceof ModelError)
			assert.equal(err.fields.status, ProjectModel.status.errorInvalid)
			return true
		})
	})

	it('validates locale correctly', () => {
		const valid = new ProjectModel({ locale: 'es' })
		assert.equal(valid.validate(), true)

		const invalid = new ProjectModel({ locale: 'invalid' })
		assert.throws(() => invalid.validate(), (err) => {
			assert.ok(err instanceof ModelError)
			assert.equal(err.fields.locale, ProjectModel.locale.errorInvalid)
			return true
		})
	})

	it('validates i18n locales correctly', () => {
		const valid = new ProjectModel({ i18n: ['en', 'fr'] })
		assert.equal(valid.validate(), true)

		const invalid = new ProjectModel({ i18n: ['en', 'invalid'] })
		assert.throws(() => invalid.validate(), (err) => {
			assert.ok(err instanceof ModelError)
			assert.equal(err.fields.i18n, ProjectModel.i18n.errorInvalid)
			return true
		})
	})
})
