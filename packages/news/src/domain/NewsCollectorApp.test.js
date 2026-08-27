import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { NewsCollectorApp } from './NewsCollectorApp.js'
import { NewsArticle } from './NewsArticle.js'
import { NewsCollectorConfig } from './NewsCollectorConfig.js'

/**
 * Mock data for testing
 */
const getMockArticles = (source) => {
	const mockData = {
		HackerNews: [
			{
				title: 'Claude 3.5 Sonnet outperforms GPT-4 in benchmark tests',
				source: 'HackerNews',
				url: 'https://news.ycombinator.com/item?id=40000001',
				score: 1250,
				published: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
				keywords: ['LLM', 'Claude', 'benchmark'],
			},
			{
				title: 'Open-source LLaMA fine-tuning guide now available',
				source: 'HackerNews',
				url: 'https://news.ycombinator.com/item?id=40000002',
				score: 890,
				published: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
				keywords: ['LLaMA', 'fine-tuning', 'open-source'],
			},
		],
		Reddit: [
			{
				title: 'AI agents are now outperforming humans in complex tasks',
				source: 'Reddit',
				url: 'https://reddit.com/r/MachineLearning/comments/ai001',
				score: 2100,
				published: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
				keywords: ['agents', 'AI', 'benchmark'],
			},
			{
				title: 'New RAG framework reduces hallucinations by 60%',
				source: 'Reddit',
				url: 'https://reddit.com/r/MachineLearning/comments/ai002',
				score: 1560,
				published: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
				keywords: ['RAG', 'hallucinations', 'framework'],
			},
		],
		Twitter: [
			{
				title: 'Transformer breakthrough: 100x faster inference with new compression',
				source: 'Twitter',
				url: 'https://twitter.com/ai_research/status/ai001',
				score: 3200,
				published: new Date(Date.now() - 30 * 60000).toISOString(),
				keywords: ['transformers', 'inference', 'compression'],
			},
		],
	}

	return (mockData[source] || []).map((a) => new NewsArticle(a))
}

describe('NewsArticle', () => {
	it('creates instance with custom data', () => {
		const article = new NewsArticle({
			title: 'Test Article',
			source: 'HackerNews',
			url: 'https://example.com',
			score: 100,
			keywords: ['test'],
		})

		assert.strictEqual(article.title, 'Test Article')
		assert.strictEqual(article.source, 'HackerNews')
		assert.strictEqual(article.score, 100)
		assert.deepStrictEqual(article.keywords, ['test'])
	})

	it('initializes with default values', () => {
		const article = new NewsArticle()
		assert.strictEqual(article.title, '')
		assert.strictEqual(article.source, 'HackerNews')
		assert.strictEqual(article.score, 0)
		assert.deepStrictEqual(article.keywords, [])
	})
})

describe('NewsCollectorConfig', () => {
	it('validates correct configuration', () => {
		const config = new NewsCollectorConfig({
			keyword: 'LLM',
			limit: 10,
			sources: ['HackerNews', 'Reddit'],
			cached: true,
		})

		assert.strictEqual(config.validate(), true)
		assert.strictEqual(config.limit, 10)
	})

	it('rejects limit exceeding max', () => {
		const config = new NewsCollectorConfig({ limit: 100 })
		assert.strictEqual(config.validate(), false)
		assert(config.getValidationErrors().some((e) => e.includes('Limit')))
	})

	it('rejects limit below min', () => {
		const config = new NewsCollectorConfig({ limit: 0 })
		assert.strictEqual(config.validate(), false)
		assert(config.getValidationErrors().some((e) => e.includes('Limit')))
	})

	it('rejects empty sources', () => {
		const config = new NewsCollectorConfig({ sources: [] })
		assert.strictEqual(config.validate(), false)
		assert(config.getValidationErrors().some((e) => e.includes('source')))
	})
})

describe('NewsCollectorApp', () => {
	/**
	 * Create app instance with mocked _fetchFromSource
	 */
	const createMockedApp = (data = {}, options = {}) => {
		const app = new NewsCollectorApp(data, { t: (key) => key, ...options })
		// Mock the _fetchFromSource method to return mock data
		app._fetchFromSource = async () => {
			const allArticles = []
			for (const source of data.sources || ['HackerNews', 'Reddit']) {
				allArticles.push(...getMockArticles(source))
			}
			return allArticles
		}
		return app
	}

	it('executes generator and yields intents', async () => {
		const app = createMockedApp({
			keyword: 'agents',
			limit: 5,
			sources: ['HackerNews', 'Reddit'],
		})

		const intents = []
		const gen = app.run()
		let res = await gen.next()
		while (!res.done) {
			intents.push(res.value)
			res = await gen.next()
		}

		const result = res.value
		intents.push(result)

		assert(intents.length > 0, 'Should yield at least one intent')
		assert(result, 'Should return a result')
		assert.strictEqual(result.type, 'result')
		assert.strictEqual(result.data.ok, true)
		assert.strictEqual(result.data.code, 200)
	})

	it('filters articles by keyword', async () => {
		const app = createMockedApp({ keyword: 'agents', limit: 50, sources: ['Reddit'] })

		const gen = app.run()
		let res = await gen.next()
		while (!res.done) res = await gen.next()
		const result = res.value

		const articles = result.data.data
		assert(articles.length > 0, 'Should find articles with "agents"')
		assert(
			articles.every(
				(a) =>
					a.keywords.some((k) => k.toLowerCase().includes('agents')) ||
					a.title.toLowerCase().includes('agents')
			)
		)
	})

	it('respects limit parameter', async () => {
		const limit = 2
		const app = createMockedApp({
			limit,
			sources: ['HackerNews', 'Reddit', 'Twitter'],
		})

		const gen = app.run()
		let res = await gen.next()
		while (!res.done) res = await gen.next()
		const result = res.value

		assert.strictEqual(result.data.data.length <= limit, true)
	})

	it('sorts articles by score descending', async () => {
		const app = createMockedApp({
			limit: 50,
			sources: ['HackerNews', 'Reddit', 'Twitter'],
		})

		const gen = app.run()
		let res = await gen.next()
		while (!res.done) res = await gen.next()
		const result = res.value

		const articles = result.data.data
		for (let i = 1; i < articles.length; i++) {
			assert(articles[i - 1].score >= articles[i].score)
		}
	})

	it('includes metadata in results', async () => {
		const app = createMockedApp({
			keyword: 'LLM',
			limit: 5,
			sources: ['HackerNews', 'Reddit'],
			cached: true,
		})

		const gen = app.run()
		let res = await gen.next()
		while (!res.done) res = await gen.next()
		const result = res.value

		const metadata = result.data.metadata
		assert(metadata, 'Should include metadata')
		assert.strictEqual(metadata.total, result.data.data.length)
		assert.strictEqual(metadata.keyword, 'LLM')
		assert.deepStrictEqual(metadata.sources, ['HackerNews', 'Reddit'])
		assert.strictEqual(metadata.cached, true)
	})

	describe('Real Fetching and Caching internals', () => {
		it('caches and reads back using this._.db when available', async () => {
			const mockDb = {
				cache: {},
				async saveDocument(uri, document) {
					this.cache[uri] = {
						data: document,
						mtimeMs: Date.now(),
						exists: true
					}
					return true
				},
				async loadDocument(uri, defaultValue) {
					return this.cache[uri] ? this.cache[uri].data : defaultValue
				},
				async statDocument(uri) {
					return this.cache[uri] || { exists: false, mtimeMs: 0 }
				}
			}

			const app = new NewsCollectorApp({
				sources: ['HackerNews'],
				cached: true
			}, {
				t: (key) => key,
				db: mockDb
			})

			app._fetchHackerNews = async () => [
				new NewsArticle({
					title: 'DB-cached HN Article',
					source: 'HackerNews',
					url: 'https://news.ycombinator.com/item?id=456',
					score: 150,
					published: new Date().toISOString(),
					keywords: ['db', 'cached']
				})
			]

			// 1. Fetch from source (should fetch fresh and save to DB cache)
			const articles = await app._fetchFromSource('HackerNews', true)
			assert.strictEqual(articles.length, 1)
			assert.strictEqual(articles[0].title, 'DB-cached HN Article')

			// Verify it saved to mock DB
			const cacheUri = '~/.cache/hackernews.json'
			assert.ok(mockDb.cache[cacheUri])
			assert.strictEqual(mockDb.cache[cacheUri].data[0].title, 'DB-cached HN Article')

			// 2. Fetch again (should load from mock DB cache)
			app._fetchHackerNews = async () => {
				throw new Error('Should not call network')
			}
			const cachedArticles = await app._fetchFromSource('HackerNews', true)
			assert.strictEqual(cachedArticles.length, 1)
			assert.strictEqual(cachedArticles[0].title, 'DB-cached HN Article')
		})
	})
})

