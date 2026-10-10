import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mockFetch } from '@nan0web/http-node'
import DBBrowser from '../../../../src/DBBrowser.js'
import BrowserDirectory from '../../../../src/Directory.js'

describe('Release v3.5.0 Contract: SSG Data Transformation & Type-Aware Storage Determination', () => {
	describe('1. determineExtension(uri, data)', () => {
		it('preserves existing extension if URI already has one', () => {
			const db = new DBBrowser()
			assert.equal(db.determineExtension('data/cards.json', [{ id: 1 }]), '.json')
			assert.equal(db.determineExtension('data/offices.csv', [{ id: 1, city: 'Kyiv' }]), '.csv')
			assert.equal(db.determineExtension('data/notes.txt', 'hello'), '.txt')
		})

		it('determines .jsonl for Array with nested objects', () => {
			const db = new DBBrowser()
			const cards = [
				{ id: 'card-1', user: { name: 'Alice' }, tags: ['vip', 'gold'] },
				{ id: 'card-2', user: { name: 'Bob' }, tags: ['standard'] },
			]
			assert.equal(db.determineExtension('data/cards', cards), '.jsonl')
		})

		it('determines .csv for Array with flat primitive columns', () => {
			const db = new DBBrowser()
			const offices = [
				{ id: 1, city: 'Kyiv', code: 'KV01', active: true },
				{ id: 2, city: 'Lviv', code: 'LV01', active: false },
			]
			assert.equal(db.determineExtension('data/offices', offices), '.csv')
		})

		it('determines .json for Object', () => {
			const db = new DBBrowser()
			const currencies = {
				UAH: { rate: 1.0, symbol: '₴' },
				USD: { rate: 41.5, symbol: '$' },
			}
			assert.equal(db.determineExtension('data/currencies', currencies), '.json')
		})

		it('determines .txt for string and .json for primitive or empty array fallback', () => {
			const db = new DBBrowser()
			assert.equal(db.determineExtension('data/readme', 'plain text'), '.txt')
			assert.equal(db.determineExtension('data/empty', []), '.json')
		})
	})

	describe('2. BrowserDirectory.DATA_EXTNAMES', () => {
		it('contains .json, .jsonl, .csv, .yaml, .nano', () => {
			assert.deepEqual(BrowserDirectory.DATA_EXTNAMES, ['.json', '.jsonl', '.csv', '.yaml', '.nano'])
		})
	})

	describe('3. loadDocument and saveDocument (.jsonl, .csv, .json)', () => {
		it('saveDocument automatically determines .jsonl for nested array and loadDocument deserializes it', async () => {
			const host = 'https://api.example.com'
			let savedBody = null
			let savedPath = null
			let savedContentType = null

			const cards = [
				{ id: 'card-1', profile: { name: 'Alice' } },
				{ id: 'card-2', profile: { name: 'Bob' } },
			]

			const db = new DBBrowser({
				host,
				fetchFn: async (url, options = {}) => {
					const pathname = new URL(url).pathname
					if (options.method === 'POST') {
						savedPath = pathname
						savedBody = options.body
						savedContentType = options.headers?.['Content-Type']
						return new Response(JSON.stringify({ ok: true }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						})
					}
					if (pathname === '/data/cards.jsonl') {
						const jsonlText = cards.map((c) => JSON.stringify(c)).join('\n')
						return new Response(jsonlText, {
							status: 200,
							headers: { 'Content-Type': 'application/x-ndjson' },
						})
					}
					return new Response('Not found', { status: 404 })
				},
			})

			await db.connect()

			// Save without extension -> should determine .jsonl
			await db.saveDocument('data/cards', cards)
			assert.equal(savedPath, '/data/cards.jsonl')
			assert.equal(savedContentType, 'application/x-ndjson')
			assert.equal(
				savedBody,
				'{"id":"card-1","profile":{"name":"Alice"}}\n{"id":"card-2","profile":{"name":"Bob"}}'
			)

			// Load without extension -> should auto-probe and parse .jsonl
			const loaded = await db.loadDocument('data/cards')
			assert.deepEqual(loaded, cards)
		})

		it('saveDocument automatically determines .csv for flat array and loadDocument deserializes it', async () => {
			const host = 'https://api.example.com'
			let savedBody = null
			let savedPath = null
			let savedContentType = null

			const offices = [
				{ id: 1, city: 'Kyiv', active: true },
				{ id: 2, city: 'Lviv', active: false },
			]

			const db = new DBBrowser({
				host,
				fetchFn: async (url, options = {}) => {
					const pathname = new URL(url).pathname
					if (options.method === 'POST') {
						savedPath = pathname
						savedBody = options.body
						savedContentType = options.headers?.['Content-Type']
						return new Response(JSON.stringify({ ok: true }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						})
					}
					if (pathname === '/data/offices.csv') {
						const csvText = 'id,city,active\n1,Kyiv,true\n2,Lviv,false'
						return new Response(csvText, {
							status: 200,
							headers: { 'Content-Type': 'text/csv' },
						})
					}
					return new Response('Not found', { status: 404 })
				},
			})

			await db.connect()

			// Save without extension -> should determine .csv
			await db.saveDocument('data/offices', offices)
			assert.equal(savedPath, '/data/offices.csv')
			assert.equal(savedContentType, 'text/csv')
			assert.equal(savedBody, 'id,city,active\n1,Kyiv,true\n2,Lviv,false')

			// Load without extension -> should auto-probe and parse .csv
			const loaded = await db.loadDocument('data/offices')
			assert.deepEqual(loaded, [
				{ id: 1, city: 'Kyiv', active: true },
				{ id: 2, city: 'Lviv', active: false },
			])
		})

		it('saveDocument determines .json for object and loadDocument deserializes it', async () => {
			const host = 'https://api.example.com'
			let savedBody = null
			let savedPath = null

			const currencies = {
				UAH: { rate: 1.0 },
				USD: { rate: 41.5 },
			}

			const db = new DBBrowser({
				host,
				fetchFn: async (url, options = {}) => {
					const pathname = new URL(url).pathname
					if (options.method === 'POST') {
						savedPath = pathname
						savedBody = options.body
						return new Response(JSON.stringify({ ok: true }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						})
					}
					if (pathname === '/data/currencies.json') {
						return new Response(JSON.stringify(currencies), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						})
					}
					return new Response('Not found', { status: 404 })
				},
			})

			await db.connect()

			// Save without extension -> should determine .json
			await db.saveDocument('data/currencies', currencies)
			assert.equal(savedPath, '/data/currencies.json')
			assert.equal(savedBody, JSON.stringify(currencies))

			// Load without extension -> should auto-probe and parse .json
			const loaded = await db.loadDocument('data/currencies')
			assert.deepEqual(loaded, currencies)
		})
	})
})
