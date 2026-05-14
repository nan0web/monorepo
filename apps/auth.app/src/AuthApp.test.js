import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import DB from '@nan0web/db'
import SignUpMessage from './messages/SignUpMessage.js'
import AuthApp from './AuthApp.js'
import { ConfirmSignUpMessage, LoginMessage } from './messages/index.js'

describe('AuthApp - Test UI', () => {
	/** @type {DB} */
	let db
	/** @type {AuthApp} */
	let app
	let tokenManager
	let tokenRotationRegistry
	let logger

	beforeEach(() => {
		db = new DB()
		tokenManager = {
			getShortHash: (value) => `hash-${value}`,
			createTokenPair: (username) => ({
				accessToken: `access-${username}`,
				refreshToken: `refresh-${username}`,
			}),
		}
		tokenRotationRegistry = {
			registerToken: () => {},
			save: () => Promise.resolve(),
			clearUserTokens: () => {},
		}
		logger = {
			debug: () => {},
			info: () => {},
			warn: () => {},
			error: () => {},
		}

		app = new AuthApp({}, { db, tokenManager, logger, tokenRotationRegistry })
	})

	describe('SignUpMessage validation', () => {
		it('should pass validation with valid input', () => {
			const message = new SignUpMessage({
				body: {
					email: 'user@example.com',
					password: 'password123',
					username: 'username',
				},
			})

			assert.ok(message.isValid, 'Valid input should pass validation')
			assert.deepStrictEqual(message.errors, [], 'No errors for valid input')
		})

		it('should fail validation with empty email', () => {
			const message = new SignUpMessage({
				body: {
					email: '',
					password: 'password123',
					username: 'username',
				},
			})

			assert.ok(!message.isValid, 'Empty email should fail validation')
			assert.ok(
				message.errors.some((e) => e === 'Email is required'),
				'Should include "email required" error',
			)
		})

		it('should fail validation with invalid email format', () => {
			const message = new SignUpMessage({
				body: {
					email: 'invalid-email',
					password: 'password123',
					username: 'username',
				},
			})

			assert.ok(!message.isValid, 'Invalid email should fail validation')
			assert.ok(
				message.errors.some((e) => e === 'Email is invalid'),
				'Should include "email invalid" error',
			)
		})

		it('should fail validation with short password', () => {
			const message = new SignUpMessage({
				body: {
					email: 'user@example.com',
					password: 'pass',
					username: 'username',
				},
			})

			assert.ok(!message.isValid, 'Short password should fail validation')
			assert.ok(
				message.errors.some(
					(e) =>
						Array.isArray(e) &&
						e[0] === 'Password must be at least {{min}} characters' &&
						e[1].min === 8,
				),
				'Should include "password too short" error with min parameter',
			)
		})
	})

	describe('Sign-up flow', () => {
		it('should create new user with valid input', async () => {
			// Mock db methods
			db.getUser = async () => null
			db.createUser = async (message) => ({
				email: message.body.email,
				username: message.body.username,
				passwordHash: message.body.password,
				verified: false,
				name: message.body.username,
			})
			db.saveVerificationCode = async (email, code) => {}

			const message = new SignUpMessage({
				body: {
					email: 'user@example.com',
					password: 'password123',
					username: 'username',
				},
			})

			const outputs = []
			for await (const output of app.signUp(message)) {
				outputs.push(output)
			}

			assert.strictEqual(outputs.length, 1, 'Should produce one output message')
			assert.ok(outputs[0].isInfo, 'Output should be info')
			assert.strictEqual(outputs[0].content[0], 'Registration successful')
		})

		it('should handle duplicate email registration', async () => {
			// Mock db methods to simulate existing user
			db.getUser = async (username) => {
				if (username === 'username') {
					return { email: 'user@example.com', username: 'username' }
				}
				return null
			}

			const message = new SignUpMessage({
				body: {
					email: 'user@example.com',
					password: 'password123',
					username: 'username',
				},
			})

			const outputs = []
			for await (const output of app.signUp(message)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'User already exists',
				'Should include user already exists error',
			)
		})
	})

	describe('Confirmation flow', () => {
		it('should confirm user with correct code', async () => {
			// Mock database methods
			const mockUser = {
				email: 'user@example.com',
				username: 'username',
				name: 'username',
				verified: false,
				verificationCode: 'ABC123',
			}

			db.getUserByEmail = async (email) => {
				if (email === 'user@example.com') return mockUser
				return null
			}

			db.saveUser = async (user) => {
				Object.assign(mockUser, user)
			}

			db.updateTokens = async () => {}

			// Confirm
			const confirmMessage = new ConfirmSignUpMessage({
				body: {
					contact: 'user@example.com',
					code: 'ABC123',
				},
			})

			const outputs = []
			for await (const output of app.confirmSignUp(confirmMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isInfo),
				'Confirmation should succeed',
			)
			assert.ok(
				outputs.some((o) => o.content.includes('Account verified successfully')),
				'Should include confirmation success message',
			)
		})

		it('should reject confirmation with invalid code', async () => {
			// Mock database methods
			const mockUser = {
				email: 'user@example.com',
				username: 'username',
				name: 'username',
				verified: false,
				verificationCode: 'ABC123',
			}

			db.getUserByEmail = async (email) => {
				if (email === 'user@example.com') return mockUser
				return null
			}

			const confirmMessage = new ConfirmSignUpMessage({
				body: {
					contact: 'user@example.com',
					code: '123456', // Wrong code
				},
			})

			const outputs = []
			for await (const output of app.confirmSignUp(confirmMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'Invalid confirmation code',
				'Should include invalid code error',
			)
		})
	})

	describe('Typed errors coverage', () => {
		it('should handle sign up with invalid data', async () => {
			const invalidMessage = new SignUpMessage({
				body: {
					email: 'invalid-email',
					password: 'short',
					username: '',
				},
			})

			const outputs = []
			for await (const output of app.signUp(invalidMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message for invalid data',
			)
			assert.ok(outputs[0].isError, 'First output should be an error')
		})

		it('should handle forgot password for non-existent user', async () => {
			db.getUser = async () => null

			const outputs = []
			for await (const output of app.forgotPassword({ body: { username: 'nonexistent' } })) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'User not found',
				'Should include user not found error',
			)
		})

		it('should handle reset password with invalid code', async () => {
			const mockUser = {
				name: 'testuser',
				resetCode: 'VALIDCODE',
			}

			db.getUser = async (username) => {
				if (username === 'testuser') return mockUser
				return null
			}
			db.updateTokens = async () => {}
			tokenRotationRegistry.validateToken = (token) => {
				if (token === 'valid-refresh-token') return 'testuser'
				return null
			}
			tokenRotationRegistry.registerToken = () => {}
			tokenRotationRegistry.revokeToken = () => {}
			tokenRotationRegistry.save = async () => {}

			const outputs = []
			for await (const output of app.refreshToken({
				body: {
					refreshToken: 'valid-refresh-token',
				},
			})) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isInfo),
				'Should produce success message',
			)
		})

		it('should handle update info with unauthorized access', async () => {
			db.auth = async () => null

			const outputs = []
			for await (const output of app.updateInfo({
				head: { authorization: 'Bearer invalidtoken' },
				body: { username: 'testuser' },
			})) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'Unauthorized',
				'Should include unauthorized error',
			)
		})

		it('should handle login with non-existent user', async () => {
			db.getUser = async () => null

			const loginMessage = new LoginMessage({
				body: {
					identifier: 'nonexistent',
					password: 'password',
				},
			})

			const outputs = []
			for await (const output of app.login(loginMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'Invalid credentials',
				'Should include invalid credentials error',
			)
		})

		it('should handle login with unverified user', async () => {
			const mockUser = {
				name: 'testuser',
				passwordHash: 'hash-password',
				verified: false,
			}

			db.getUser = async (identifier) => {
				if (identifier === 'testuser') return mockUser
				return null
			}

			db.auth = async () => null

			const loginMessage = new LoginMessage({
				body: {
					identifier: 'testuser',
					password: 'password',
				},
			})

			const outputs = []
			for await (const output of app.login(loginMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message.includes('Account not verified'),
				'Should include account not verified error',
			)
		})

		it('should handle login with invalid password', async () => {
			const mockUser = {
				name: 'testuser',
				passwordHash: 'hash-correctpassword',
				verified: true,
			}

			db.getUser = async (identifier) => {
				if (identifier === 'testuser') return mockUser
				return null
			}

			db.auth = async () => null

			const loginMessage = new LoginMessage({
				body: {
					identifier: 'testuser',
					password: 'wrongpassword',
				},
			})

			const outputs = []
			for await (const output of app.login(loginMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'Invalid credentials',
				'Should include invalid credentials error',
			)
		})

		it('should handle confirm signup for non-existent user', async () => {
			db.getUserByEmail = async () => null

			const confirmMessage = new ConfirmSignUpMessage({
				body: {
					contact: 'nonexistent@example.com',
					code: 'ABC123',
				},
			})

			const outputs = []
			for await (const output of app.confirmSignUp(confirmMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'User not found',
				'Should include user not found error',
			)
		})

		it('should handle confirm signup for already verified user', async () => {
			const mockUser = {
				email: 'user@example.com',
				name: 'testuser',
				verified: true,
			}

			db.getUserByEmail = async (contact) => {
				if (contact === 'user@example.com') return mockUser
				return null
			}

			const confirmMessage = new ConfirmSignUpMessage({
				body: {
					contact: 'user@example.com',
					code: 'ABC123',
				},
			})

			const outputs = []
			for await (const output of app.confirmSignUp(confirmMessage)) {
				outputs.push(output)
			}

			assert.ok(
				outputs.some((o) => o.isError),
				'Should produce error message',
			)
			assert.ok(
				outputs.find((o) => o.isError).error.message === 'User already verified',
				'Should include user already verified error',
			)
		})
	})
})
