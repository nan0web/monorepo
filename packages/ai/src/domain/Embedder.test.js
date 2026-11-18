import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ModelError } from '@nan0web/types'
import { Embedder } from './Embedder.js'

describe('Embedder', () => {
	it('checkAvailability() resolves when /models responds with ok: true', async () => {
		let requestedUrl = ''
		const mockFetch = async (url) => {
			requestedUrl = url
			return { ok: true, status: 200, statusText: 'OK' }
		}
		const embedder = new Embedder({
			baseURL: 'http://localhost:1234/v1/',
			fetch: mockFetch,
		})
		await embedder.checkAvailability()
		assert.equal(requestedUrl, 'http://localhost:1234/v1/models')
	})

	it('checkAvailability() throws ModelError with connection example on fetch TypeError', async () => {
		const mockFetch = async () => {
			throw new TypeError('fetch failed')
		}
		const embedder = new Embedder({
			baseURL: 'http://localhost:1234/v1',
			model: 'text-embedding-multilingual-e5-large-instruct',
			fetch: mockFetch,
		})
		await assert.rejects(
			() => embedder.checkAvailability(),
			(err) => {
				assert.ok(err instanceof ModelError, 'Should throw ModelError instead of TypeError')
				assert.ok(
					err.message.includes('http://localhost:1234/v1'),
					'Message should include baseURL'
				)
				assert.ok(
					err.message.includes('new Embedder('),
					'Message should include connection example'
				)
				return true
			}
		)
	})

	it('checkAvailability() throws ModelError when /models returns non-ok status', async () => {
		const mockFetch = async () => ({
			ok: false,
			status: 503,
			statusText: 'Service Unavailable',
		})
		const embedder = new Embedder({
			baseURL: 'http://localhost:1234/v1',
			fetch: mockFetch,
		})
		await assert.rejects(
			() => embedder.checkAvailability(),
			(err) => {
				assert.ok(err instanceof ModelError, 'Should throw ModelError')
				assert.ok(err.message.includes('503'), 'Message should include status code')
				assert.ok(
					err.message.includes('new Embedder('),
					'Message should include connection example'
				)
				return true
			}
		)
	})

	it('embed() throws ModelError with connection example instead of raw TypeError: fetch failed', async () => {
		const mockFetch = async () => {
			throw new TypeError('fetch failed')
		}
		const embedder = new Embedder({
			baseURL: 'http://localhost:1234/v1',
			fetch: mockFetch,
		})
		await assert.rejects(
			() => embedder.embed('hello'),
			(err) => {
				assert.ok(err instanceof ModelError, 'Should throw ModelError instead of TypeError')
				assert.ok(
					err.message.includes('http://localhost:1234/v1'),
					'Message should include baseURL'
				)
				assert.ok(
					err.message.includes('new Embedder('),
					'Message should include connection example'
				)
				return true
			}
		)
	})
})
