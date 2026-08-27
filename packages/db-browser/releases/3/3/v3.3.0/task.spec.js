import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mockFetch } from '@nan0web/http-node'
import DBBrowser from '../../../../src/DBBrowser.js'

describe('Release v3.3.0 Contract: DBBrowser Fetch Pipeline', () => {
	it('db.fetch() resolves inheritance from _.json', async () => {
		const host = 'https://api.example.com'
		const db = new DBBrowser({
			host,
			fetchFn: mockFetch([
				['GET ' + host + '/_.json', { siteName: 'NanoWeb', theme: 'light' }],
				['GET ' + host + '/dir/_.json', { theme: 'dark', locale: 'uk' }],
				['GET ' + host + '/dir/page.json', { title: 'Dashboard' }],
				['GET ' + host + '/index.txt', '_.json 1 1\ndir/_.json 1 1\ndir/page.json 1 1'],
			]),
		})
		await db.connect()
		const result = await db.fetch('dir/page.json')
		assert.deepStrictEqual(result, {
			siteName: 'NanoWeb',
			theme: 'dark',
			locale: 'uk',
			title: 'Dashboard',
		})
	})

	it('db.fetch() resolves globals from _/ directories', async () => {
		const host = 'https://api.example.com'
		const db = new DBBrowser({
			host,
			fetchFn: mockFetch([
				['GET ' + host + '/_/currencies.json', [200, ['BTC', 'UAH']]],
				['GET ' + host + '/index.txtl', [200, '_/currencies.json 1 1\naccount.json 1 1']],
				['GET ' + host + '/account.json', [200, { user: 'Admin' }]],
			]),
		})
		await db.connect()
		const result = await db.fetch('account.json')
		assert.deepStrictEqual(result, {
			currencies: ['BTC', 'UAH'],
			user: 'Admin',
		})
	})

	it('db.fetch() resolves $ref: references across documents', async () => {
		const host = 'https://api.example.com'
		const db = new DBBrowser({
			host,
			fetchFn: mockFetch([
				['GET ' + host + '/ref.json', { prop: { sub: 'target-value' } }],
				['GET ' + host + '/data.json', { key: '$ref:ref.json#prop/sub', self: true }],
			]),
		})
		await db.connect()
		const result = await db.fetch('data.json')
		assert.deepStrictEqual(result, {
			key: 'target-value',
			self: true,
		})
	})
})
