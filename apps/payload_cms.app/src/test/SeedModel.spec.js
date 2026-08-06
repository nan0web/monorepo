import { describe, it } from 'node:test'
import assert from 'node:assert'
import { SeedModel } from '../domain/models/SeedModel.js'

describe('SeedModel Story', () => {
	it('should execute seed flow with mocked DB-FS instance', async () => {
		const mockDb = {
			Directory: {
				isConfig: () => false,
				isDirectory: () => false,
				isGlobal: () => false,
				isData: () => true,
			},
			browse: async function* () {
				yield { path: 'data/cards.yaml' }
				yield { path: 'data/news.json' }
			},
			fetch: async (uri) => {
				if (uri === 'data/cards.yaml') {
					return [{ id: 'card1' }, { id: 'card2' }]
				}
				if (uri === 'data/news.json') {
					return { id: 'news1' }
				}
				return null
			},
			get: async (uri) => {
				if (uri === 'data/cards.yaml') {
					return [{ id: 'card1' }, { id: 'card2' }]
				}
				if (uri === 'data/news.json') {
					return { id: 'news1' }
				}
				return null
			},
		}

		const seedModel = new SeedModel(
			{ target: 'data' },
			{
				db: mockDb,
				t: (key, params) => {
					if (params?.count !== undefined) return `Count: ${params.count}`
					if (params?.target) return `Target: ${params.target}`
					if (params?.uri) return `URI: ${params.uri}`
					return key
				},
			}
		)

		const intents = []
		let finalResult = null

		const gen = seedModel.run()
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
})
