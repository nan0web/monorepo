import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ShellModel } from '@nan0web/ui'
import { AppRunner } from './runner.js'

function createMockDb(entries = []) {
	return new DB({ data: new Map(entries) })
}

describe('ShellModel Dynamic Navigation', () => {
	it('builds dynamic choices when nav.nan0 exists', async () => {
		const db = createMockDb([
			['nan0web.nan0', { name: 'Test App', locale: 'en' }],
			['data/index.yaml', {
				nav: [
					{ title: 'Home', href: '/' },
					{ title: 'Docs', href: 'docs' }
				]
			}]
		])

		const runner = new AppRunner({ db })
		const infra = {
			AppRunner: function() { return runner },
			dsn: 'data/',
			locale: 'en',
			data: 'data/'
		}

		const app = new ShellModel({ locale: 'en', data: 'data/' }, infra)
		const gen = app.run()

		// 1. Initial boot log
		let next = await gen.next()
		assert.equal(next.value.type, 'log')
		assert.ok(next.value.message.includes('Shell Ready'))

		// 2. The next yield should be ask navigation
		next = await gen.next()
		assert.equal(next.value.type, 'ask')
		assert.equal(next.value.field, 'navigation')
		assert.ok(next.value.schema.command.options.some(o => o.value === 'nav:/'))
		assert.ok(next.value.schema.command.options.some(o => o.value === 'nav:docs'))
	})

	it('renders page blocks to ContentViewer when navigation item is selected', async () => {
		const db = createMockDb([
			['nan0web.nan0', { name: 'Test App', locale: 'en' }],
			['data/index.yaml', {
				nav: [
					{ title: 'Docs', href: 'docs' }
				],
				pages: [
					{ slug: 'docs', title: 'Docs Page', source: 'docs-data' }
				]
			}],
			['data/docs-data.yaml', [
				{ h1: 'Documentation' },
				{ p: 'Welcome to the docs!' }
			]]
		])

		const runner = new AppRunner({ db })
		const infra = {
			AppRunner: function() { return runner },
			dsn: 'data/',
			locale: 'en',
			data: 'data/'
		}

		const app = new ShellModel({ command: 'nav:docs', locale: 'en', data: 'data/' }, infra)
		const gen = app.run()

		// 1. Initial boot log
		let next = await gen.next()
		assert.equal(next.value.type, 'log')

		// 2. Next yield should trigger pageViewer content-viewer ask
		next = await gen.next()
		assert.equal(next.value.type, 'ask')
		assert.equal(next.value.field, 'pageViewer')
		assert.equal(next.value.schema.hint, 'content-viewer')
		assert.equal(next.value.schema.title, 'Docs Page')
		assert.ok(next.value.schema.content.includes('# Documentation'))
		assert.ok(next.value.schema.content.includes('Welcome to the docs!'))

		// 3. Completes generator
		next = await gen.next()
		assert.equal(next.done, true)
	})
})
