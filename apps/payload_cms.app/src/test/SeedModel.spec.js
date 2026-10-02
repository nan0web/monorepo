import { describe, it } from 'node:test'
import assert from 'node:assert'
import { SeedApp, SeedModel } from '../domain/models/SeedModel.js'

describe('SeedApp Story', () => {
	it('should export SeedApp as class and SeedModel as alias', () => {
		assert.strictEqual(SeedApp, SeedModel)
	})

	it('should execute seed flow with mocked DB instance', async () => {
		const mockDb = {
			resolveSync: (...args) => args.filter(Boolean).join('/'),
			basename: (p) => p.split('/').pop(),
			dirname: (p) => p.split('/').slice(0, -1).join('/'),
			extname: (p) => {
				const base = p.split('/').pop() || ''
				const idx = base.lastIndexOf('.')
				return idx !== -1 ? base.slice(idx) : ''
			},
			Directory: {
				isConfig: () => false,
				isDirectory: () => false,
				isGlobal: () => false,
				isIndex: () => false,
				isData: () => true,
			},
			browse: async function* () {
				yield { path: 'cards.yaml' }
				yield { path: 'news.json' }
			},
			fetch: async (uri) => {
				if (uri === 'cards.yaml') {
					return [{ id: 'card1' }, { id: 'card2' }]
				}
				if (uri === 'news.json') {
					return { id: 'news1' }
				}
				return null
			},
			get: async (uri) => {
				if (uri === 'cards.yaml') {
					return [{ id: 'card1' }, { id: 'card2' }]
				}
				if (uri === 'news.json') {
					return { id: 'news1' }
				}
				return null
			},
		}

		const mockPayload = {
			create: async () => ({ id: 'created' }),
			find: async () => ({ docs: [] }),
		}

		const seedApp = new SeedApp(
			{},
			{
				db: mockDb,
				payload: mockPayload,
				t: (key, params) => {
					if (params?.count !== undefined) return `Count: ${params.count}`
					if (params?.uri) return `URI: ${params.uri}`
					return key
				},
			}
		)

		const intents = []
		let finalResult = null

		const gen = seedApp.run()
		let step = await gen.next()
		while (!step.done) {
			intents.push(step.value)
			step = await gen.next()
		}
		finalResult = step.value

		assert.strictEqual(finalResult?.data?.status, 'ok')
		assert.strictEqual(finalResult?.data?.count, 3)
		assert.ok(intents.length > 0)
	})

	it('should accept injected payload instance and seed data using this.$db mounts without fs/path', async () => {
		const createdRecords = []
		const mockPayload = {
			create: async ({ collection, data }) => {
				createdRecords.push({ collection, data })
				return { id: 'created-' + createdRecords.length, ...data }
			},
			find: async () => ({ docs: [] }),
			config: {
				collections: [{ slug: 'articles' }, { slug: 'categories' }],
			},
		}

		const mockDb = {
			resolveSync: (...args) => args.filter(Boolean).join('/'),
			basename: (p) => p.split('/').pop(),
			dirname: (p) => p.split('/').slice(0, -1).join('/'),
			extname: (p) => {
				const base = p.split('/').pop() || ''
				const idx = base.lastIndexOf('.')
				return idx !== -1 ? base.slice(idx) : ''
			},
			relative: (from, to) => to.replace(from, '').replace(/^\//, ''),
			Directory: {
				isConfig: () => false,
				isDirectory: () => false,
			},
			browse: async function* () {
				yield { path: 'articles/item1.yaml' }
				yield { path: 'categories/main.json' }
			},
			fetch: async (uri) => {
				if (uri === 'articles/item1.yaml') {
					return {
						title: 'Article 1',
						slug: 'article-1',
						description: 'Content',
					}
				}
				if (uri === 'categories/main.json') {
					return {
						$collection: 'categories',
						items: [
							{ title: 'Tech', slug: 'tech' },
							{ title: 'Science', slug: 'science' },
						],
					}
				}
				return null
			},
		}

		const seedApp = new SeedApp(
			{},
			{
				db: mockDb,
				payload: mockPayload,
				t: (k, p) => (p?.uri ? `URI: ${p.uri}` : k),
			}
		)

		assert.strictEqual(seedApp._.payload, mockPayload, 'payload should be injected into this._')
		assert.strictEqual(seedApp.$db, mockDb, 'this.$db should return injected DB')

		const intents = []
		for await (const intent of seedApp.run()) {
			intents.push(intent)
		}

		assert.strictEqual(createdRecords.length, 3, 'Should seed 1 article and 2 categories')
		assert.strictEqual(createdRecords[0].collection, 'articles')
		assert.strictEqual(createdRecords[0].data.title, 'Article 1')
		assert.strictEqual(createdRecords[1].collection, 'categories')
		assert.strictEqual(createdRecords[1].data.title, 'Tech')
		assert.strictEqual(createdRecords[2].collection, 'categories')
		assert.strictEqual(createdRecords[2].data.title, 'Science')
	})

	it('should throw an Error when accessing $payload if payload is not injected', () => {
		const seedApp = new SeedApp({}, { db: {} })
		assert.throws(
			() => {
				const _ = seedApp.$payload
			},
			{
				message: /Payload instance \(\$payload\) is required for seed/,
			}
		)
	})
})
