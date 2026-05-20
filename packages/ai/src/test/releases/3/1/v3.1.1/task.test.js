import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { Embedder } from '../../../../../domain/Embedder.js'
import { MarkdownIndexer } from '../../../../../domain/MarkdownIndexer.js'

describe('v3.1.1 E5 prefixing contract', () => {
	it('should prepend query: prefix for E5 query embeddings', async () => {
		let capturedBody = null
		const mockFetch = async (url, options) => {
			capturedBody = JSON.parse(options.body)
			return {
				ok: true,
				json: async () => ({
					data: [{ index: 0, embedding: new Array(1024).fill(0.1) }],
				}),
			}
		}

		const embedder = new Embedder({
			model: 'text-embedding-multilingual-e5-large-instruct',
			fetch: mockFetch,
		})

		await embedder.embed('hello world', { type: 'query' })
		assert.equal(capturedBody.input[0], 'query: hello world')
	})

	it('should prepend passage: prefix for E5 passage embeddings', async () => {
		let capturedBody = null
		const mockFetch = async (url, options) => {
			capturedBody = JSON.parse(options.body)
			return {
				ok: true,
				json: async () => ({
					data: [{ index: 0, embedding: new Array(1024).fill(0.1) }],
				}),
			}
		}

		const embedder = new Embedder({
			model: 'text-embedding-multilingual-e5-large-instruct',
			fetch: mockFetch,
		})

		await embedder.embedBatch(['doc 1', 'doc 2'], { type: 'passage' })
		assert.deepEqual(capturedBody.input, ['passage: doc 1', 'passage: doc 2'])
	})

	it('should not prepend prefix for non-E5 models', async () => {
		let capturedBody = null
		const mockFetch = async (url, options) => {
			capturedBody = JSON.parse(options.body)
			return {
				ok: true,
				json: async () => ({
					data: [{ index: 0, embedding: new Array(1024).fill(0.1) }],
				}),
			}
		}

		const embedder = new Embedder({
			model: 'some-other-model',
			fetch: mockFetch,
		})

		await embedder.embed('hello world', { type: 'query' })
		assert.equal(capturedBody.input[0], 'hello world')
	})

	it('should only embed non-cached chunks when indexing a project', async () => {
		const chunk1Text = `## Heading 1
This is a very long paragraph that has a lot of content inside it to make sure that the length of the section exceeds one hundred and fifty characters so that it is not merged with the next section. It needs to be long enough.`

		const content = `${chunk1Text}

## Heading 2
This is the second section, which is also very long and has a lot of content inside it to exceed one hundred and fifty characters so that it is processed as its own chunk and not merged.`

		const crypto = await import('node:crypto')
		const hash1 = crypto.createHash('md5').update(chunk1Text).digest('hex')

		const floatArr = new Float32Array(1024).fill(0.5)
		const b64Vector = Buffer.from(
			floatArr.buffer,
			floatArr.byteOffset,
			floatArr.byteLength,
		).toString('base64')

		const db = new DB({
			predefined: [
				['pnpm-workspace.yaml', ''],
				['.datasets/vectors.csv', `${hash1},${b64Vector}\n`],
				['.datasets/docs-docs-index.cache.json', '{}'],
				['docs/test.md', content],
			],
		})
		await db.connect()

		let embeddedTexts = []
		const mockFetch = async (url, options) => {
			const body = JSON.parse(options.body)
			embeddedTexts = embeddedTexts.concat(body.input)
			return {
				ok: true,
				json: async () => ({
					data: body.input.map((t, idx) => ({ index: idx, embedding: new Array(1024).fill(0.9) })),
				}),
			}
		}

		const embedder = new Embedder({
			model: 'text-embedding-multilingual-e5-large-instruct',
			fetch: mockFetch,
		})

		const indexer = new MarkdownIndexer(
			{
				targetProject: 'docs',
				targetDir: '.',
				scope: 'docs',
			},
			{
				workspaceRoot: '.',
				workspaceDb: db,
				storeDb: db,
				t: (k) => k,
			},
		)

		const events = []
		for await (const ev of indexer.indexAll(embedder)) {
			events.push(ev)
		}

		// The indexer should ONLY call embedBatch for the second chunk (which is not cached).
		assert.equal(embeddedTexts.length, 2)
		assert.equal(embeddedTexts[0], 'test')
		assert.ok(embeddedTexts[1].includes('Heading 2'))
		assert.ok(!embeddedTexts[1].includes('Heading 1'))
	})
})
