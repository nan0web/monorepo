import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { mockFetch } from '@nan0web/test'
import { NoConsole } from '@nan0web/log'
import AuthDB from './AuthDB.js'

/**
 * @param {object} options
 * @returns {AuthDB}
 */
const createClient = (options = {}) => {
	const defaults = { cwd: 'http://localhost', root: '/' }
	return new AuthDB({ ...defaults, ...options })
}

describe('AuthDB', () => {
	describe('constructor', () => {
		it('should initialize as DataDB extension', () => {
			const client = createClient()
			assert.ok(client instanceof AuthDB)
			assert.ok(client.fetchMerged)
			assert.ok(client.fetch)
		})
	})

	describe('auth methods', () => {
		it('should set token and me on successful signIn', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['POST http://localhost/auth/signin/test', { token: 'test-token' }]])

			const result = await client.signIn('test', 'password')
			assert.equal(result.token, 'test-token')
			assert.equal(client.token, 'test-token')
			assert.equal(client.me, 'test')
		})

		it('should clear token on signOut', async () => {
			const client = createClient()
			client.token = 'test-token'
			client.me = 'test'
			client.fetchFn = mockFetch([['DELETE http://localhost/auth/signin/test', true]])

			const result = await client.signOut('test')
			assert.equal(result, true)
			assert.equal(client.token, '')
		})

		it('should not clear token on signOut of different user', async () => {
			const client = createClient()
			client.token = 'test-token'
			client.me = 'other'
			client.fetchFn = mockFetch([['DELETE http://localhost/auth/signin/test', true]])

			const result = await client.signOut('test')
			assert.equal(result, true)
			assert.equal(client.token, 'test-token')
		})

		it('should handle registration flow', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([
				['POST http://localhost/auth/signup', { message: 'Verification code sent' }],
				['PUT http://localhost/auth/signup/test', { token: 'confirmed-token' }],
				['DELETE http://localhost/auth/signup/test', true],
			])

			const signup = await client.register({ username: 'test', password: 'pass' })
			assert.equal(signup.message, 'Verification code sent')

			const confirm = await client.confirmRegistration('test', '123456')
			assert.equal(confirm.token, 'confirmed-token')

			const data = await client.deleteAccount('test')
			assert.equal(data, true)
		})

		it('should handle password reset flow', async () => {
			const client = createClient()
			client.me = 'test'
			client.token = 'old-token'
			client.fetchFn = mockFetch([
				['POST http://localhost/auth/forgot/test', { success: true }],
				['PUT http://localhost/auth/forgot/test', { token: 'reset-token' }],
			])

			const forgot = await client.forgotPassword('test')
			assert.equal(forgot.success, true)
			assert.equal(client.token, '')

			const reset = await client.resetPassword('test', '123456', 'newpass')
			assert.equal(reset.token, 'reset-token')
			assert.equal(client.token, 'reset-token')
		})

		it('should handle token refresh', async () => {
			const client = createClient()
			client.token = 'old-token'
			client.fetchFn = mockFetch([['PUT http://localhost/auth/refresh/old-token', { token: 'new-token' }]])

			const result = await client.refreshToken('old-token')
			assert.equal(result.token, 'new-token')
		})

		it('should handle 3rd party auth', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['POST http://localhost/auth/google', { token: 'google-token' }]])

			const result = await client.authWithProvider('google', 'google-auth-token')
			assert.equal(result.token, 'google-token')
			assert.equal(client.token, 'google-token')
		})

		it('should handle 3rd party auth failure', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['POST http://localhost/auth/google', {}]])

			const result = await client.authWithProvider('google', 'invalid-token')
			assert.equal(result.token, undefined)
			assert.equal(client.token, '')
		})
	})

	describe('user methods', () => {
		it('should get user data', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([
				['GET http://localhost/auth/signin/test', { name: 'test', email: 'test@example.com' }],
				['GET http://localhost/public/', [404, 'Not found [GET]']],
			])

			const user = await client.getUser('test')
			assert.equal(user.name, 'test')
			assert.equal(user.email, 'test@example.com')
		})

		it('should get user info', async () => {
			const client = createClient({ console: new NoConsole() })
			client.fetchFn = mockFetch([
				['GET http://localhost/auth/info/test', { name: 'test', email: 'test@example.com' }],
				['GET *', [404, { error: 'Document not found' }]],
				['*', [401, { error: 'Forbidden' }]],
			])

			const user = await client.getUserInfo('test')
			assert.equal(user.name, 'test')
			assert.equal(user.email, 'test@example.com')

			const err1 = await client.loadDocument('public/anything')
			assert.equal(err1, undefined)

			const err2 = async () => await client.saveDocument('public/anything')
			await assert.rejects(err2, /Forbidden/)
		})

		it('should list users', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['GET http://localhost/auth/info', [200, ['user1', 'user2', 'user3']]]])

			const users = await client.listUsers()
			assert.deepEqual(users, ['user1', 'user2', 'user3'])
		})
	})

	describe('ensureAccess', () => {
		it('should allow access to public directories without token', async () => {
			const client = createClient()
			client.token = ''
			await client.ensureAccess('auth/some/path')
			await client.ensureAccess('public/some/path')
		})

		it('should deny access to protected routes without token', async () => {
			const client = createClient()
			client.token = ''
			const err = async () => await client.ensureAccess('protected/path')
			await assert.rejects(err, /Authentication required/)
		})

		it('should allow access to protected routes with token', async () => {
			const client = createClient()
			client.token = 'valid-token'
			await client.ensureAccess('protected/path')
		})
	})

	describe('registration methods', () => {
		it('should save signup data on register', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['POST http://localhost/auth/signup', { message: 'Verification code sent' }]])

			const result = await client.register({ username: 'newuser', password: 'password123' })
			assert.equal(result.message, 'Verification code sent')
		})

		it('should confirm registration with code', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['PUT http://localhost/auth/signup/testuser', { token: 'confirmation-token' }]])

			const result = await client.confirmRegistration('testuser', '123456')
			assert.equal(result.token, 'confirmation-token')
		})

		it('should delete account', async () => {
			const client = createClient()
			client.fetchFn = mockFetch([['DELETE http://localhost/auth/signup/testuser', true]])

			const result = await client.deleteAccount('testuser')
			assert.equal(result, true)
		})
	})
})
