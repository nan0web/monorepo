import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DBBrowser from '../../../../src/DBBrowser.js'

describe('v1.1.2: Body consumption bug', () => {
	it('should load text document even if it is not JSON (loadDocument)', async () => {
		const db = new DBBrowser({
			host: 'http://localhost',
			fetchFn: async () => new Response('not a json', {
				status: 200,
				headers: { 'content-type': 'text/plain' }
			})
		})

		const result = await db.loadDocument('index.txt')
		assert.equal(result, 'not a json')
	})

	it('should load JSON document successfully (loadDocument)', async () => {
		const db = new DBBrowser({
			host: 'http://localhost',
			fetchFn: async () => new Response('{"test":true}', {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		})

		const result = await db.loadDocument('test.json')
		assert.deepEqual(result, { test: true })
	})

	it('should handle non-JSON error payloads in throwError', async () => {
		const db = new DBBrowser({ host: 'http://localhost' })
		const response = new Response('Internal Server Error', {
			status: 500,
			headers: { 'content-type': 'text/plain' }
		})

		await assert.rejects(
			async () => await db.throwError(response, 'Fallback message'),
			(err) => {
				assert.equal(err.status, 500)
				assert.equal(err.message, 'Internal Server Error')
				return true
			}
		)
	})

	it('should handle non-JSON response in writeDocument', async () => {
		const db = new DBBrowser({
			host: 'http://localhost',
			fetchFn: async () => new Response('success', {
				status: 200,
				headers: { 'content-type': 'text/plain' }
			})
		})

		const result = await db.writeDocument('test.json', { data: true })
		assert.equal(result, 'success')
	})
})
