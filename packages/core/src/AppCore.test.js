import { test, describe } from 'node:test'
import { strictEqual, deepEqual, rejects } from 'node:assert'
import AppCore from './AppCore.js'
import DB from '@nan0web/db'

describe('AppCore', () => {
	test('constructor initializes properties correctly', () => {
		const db = new DB()
		const app = new AppCore({ db, locale: 'en' })

		strictEqual(app.db, db)
		strictEqual(app.locale, 'en')
		deepEqual(app.data, {})
		deepEqual(app.actions, {})
		deepEqual(app.meta, {})
	})

	test('constructor uses default locale when not provided', () => {
		const db = new DB()
		const app = new AppCore({ db })

		strictEqual(app.locale, 'uk')
	})

	test('bootstrapI18n loads translations from db', async () => {
		const db = new DB()
		const mockTranslations = { 'test.key': 'Test Value' }
		db.fetch = async () => mockTranslations

		const app = new AppCore({ db, locale: 'en' })
		await app.bootstrapI18n('/custom/{{locale}}.json')

		const result = app.t('test.key')
		strictEqual(result, 'Test Value')
	})

	test('state() returns current application state', () => {
		const db = new DB()
		const app = new AppCore({ db })

		const state = app.state()
		deepEqual(Object.keys(state), ['data', 'actions', 'meta', 't'])
	})

	test('run() throws error when not implemented', async () => {
		const db = new DB()
		const app = new AppCore({ db })

		await rejects(
			async () => {
				await app.run()
			},
			{
				name: 'Error',
				message: 'AppCore: run() must be implemented',
			},
		)
	})
})
