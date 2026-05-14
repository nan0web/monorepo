import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { mockFetch } from '@nan0web/test'
import FacebookAuthClient from './FacebookAuth.js'

describe('FacebookAuthClient', () => {
	/** @type {FacebookAuthClient} */
	let client

	const testToken = 'facebook-access-token'
	const expectedResponse = { token: 'something' }

	beforeEach(() => {
		client = new FacebookAuthClient({ host: 'http://localhost', root: '/' })
		client.fetchFn = mockFetch([['POST http://localhost/auth/facebook', { token: 'something' }]])
	})

	describe('auth with provider', () => {
		it('should return server token after successful authentication', async () => {
			const tokens = await client.auth(testToken)
			assert.equal(tokens.token, expectedResponse.token)
		})

		it('should retain connection data', async () => {
			const client1 = new FacebookAuthClient({ host: 'http://localhost', root: '/', token: testToken + '1' })
			client1.fetchFn = client.fetchFn
			await client1.auth(testToken + '1')
			assert.equal(client1.token, expectedResponse.token)
		})
	})
})
