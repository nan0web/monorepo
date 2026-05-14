import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { CLiInputAdapter as CLIInputAdapter } from '@nan0web/ui-cli'
import { CancelError } from '@nan0web/ui'
import InMemoryDB from '@nan0web/db'
import AuthCLI from './AuthCLI.js'
import { SignUpMessage, ConfirmSignUpMessage, LoginMessage } from '../messages/index.js'

describe('AuthCLI', () => {
	let cli
	let db

	beforeEach(() => {
		db = new InMemoryDB()
		db.saveVerificationCode = async () => {}
		db.create = async () => {}
		db.confirmUser = async () => {}
		db.authenticate = async () => ({})

		cli = new AuthCLI({ db })

		// Mock adapter methods
		cli.adapter = Object.assign(new CLIInputAdapter(), {
			logger: {
				error: () => {},
				info: () => {},
				success: () => {},
			},
			requestForm: () => Promise.resolve({}),
			requestInput: () => Promise.resolve(''),
			requestSelect: () => Promise.resolve(''),
		})
	})

	afterEach(() => {
		// Reset mocks if needed
	})

	describe('signup', () => {
		it('should collect valid user data and process signup', async () => {
			// Mock form
			cli.adapter.requestForm = () =>
				Promise.resolve({
					form: {
						state: {
							email: 'user@example.com',
							password: 'password123',
							username: 'username',
						},
					},
				})

			// Mock message stream from app
			cli.app.run = async function* ({ action, body }) {
				assert.strictEqual(action, 'sign-up')
				yield {
					isInfo: true,
					content: ['Registration successful', 'Check your email to confirm registration'],
				}
			}

			// Run signup
			const result = await cli.signup()

			// Check result
			assert.ok(result.success, 'Signup should be successful')
			assert.ok(!result.messages[0].isError, 'Message should not be an error')
		})

		it('should handle user cancellation', async () => {
			// Mock cancellation
			const cancelErr = new CancelError()
			cli.adapter.requestForm = () => Promise.reject(cancelErr)

			// Try signup with cancelled input
			const result = await cli.signup()

			// Check cancellation handling
			assert.ok(result.cancelled, 'Result should indicate cancellation')
		})

		it('should handle validation errors', async () => {
			// Mock form with invalid input
			cli.adapter.requestForm = () =>
				Promise.resolve({
					form: {
						state: {
							email: 'invalid-email',
							password: 'short',
							username: 'username',
						},
					},
				})

			// Mock message stream from app
			cli.app.run = async function* ({ action, body }) {
				yield {
					isError: true,
					content: ['Email is invalid', 'Password must be at least 8 characters'],
				}
			}

			// Run signup
			const result = await cli.signup()

			// Check error handling
			assert.ok(!result.success, 'Signup should fail with invalid data')
		})
	})

	describe('confirmSignup', () => {
		it('should collect confirmation data and process confirmation', async () => {
			// Mock form
			cli.adapter.requestForm = () =>
				Promise.resolve({
					form: {
						state: {
							contact: 'user@example.com',
							code: 'ABC123',
						},
					},
				})

			// Mock message stream from app
			cli.app.run = async function* ({ action, body }) {
				assert.strictEqual(action, 'confirm-signup')
				yield {
					isInfo: true,
					content: ['Account verified successfully', 'You are now part of our community'],
				}
			}

			// Run confirmation
			const result = await cli.confirmSignup()

			// Check result
			assert.ok(result.success, 'Confirmation should be successful')
		})
	})

	describe('login', () => {
		it('should collect login data and process login', async () => {
			// Mock form
			cli.adapter.requestForm = () =>
				Promise.resolve({
					form: {
						state: {
							identifier: 'testuser',
							password: 'password123',
						},
					},
				})

			// Mock message stream from app
			cli.app.run = async function* ({ action, body }) {
				assert.strictEqual(action, 'login')
				yield {
					isInfo: true,
					content: ['Welcome!', 'You have been successfully logged in'],
				}
			}

			// Run login
			const result = await cli.login()

			// Check result
			assert.ok(result.success, 'Login should be successful')
		})
	})

	describe('field validation', () => {
		it('should validate required fields from SignUpMessage', () => {
			// These fields are now accessible through SignUpMessage
			const message = new SignUpMessage({
				body: {
					email: 'test@example.com',
					password: 'password123',
					username: 'testuser',
				},
			})

			assert.ok(message.emailLabel, 'Should have emailLabel')
			assert.ok(message.passwordLabel, 'Should have passwordLabel')
			assert.ok(message.usernameLabel, 'Should have usernameLabel')
			assert.strictEqual(
				typeof message.isValid,
				'boolean',
				'Should have isValid property as boolean',
			)
			assert.ok(Array.isArray(message.errors), 'Should have errors as array')
		})

		it('should validate required fields from ConfirmSignUpMessage', () => {
			// Check ConfirmSignUpMessage
			const message = new ConfirmSignUpMessage({
				body: {
					contact: 'test@example.com',
					code: '123456',
				},
			})

			assert.ok(message.contactLabel, 'Should have contactLabel')
			assert.ok(message.codeLabel, 'Should have codeLabel')
			assert.strictEqual(
				typeof message.isValid,
				'boolean',
				'Should have isValid property as boolean',
			)
			assert.ok(Array.isArray(message.errors), 'Should have errors as array')
		})

		it('should validate required fields from LoginMessage', () => {
			// Check LoginMessage
			const message = new LoginMessage({
				body: {
					identifier: 'testuser',
					password: 'password123',
				},
			})

			assert.ok(message.identifierLabel, 'Should have identifierLabel')
			assert.ok(message.passwordLabel, 'Should have passwordLabel')
			assert.strictEqual(
				typeof message.isValid,
				'boolean',
				'Should have isValid property as boolean',
			)
			assert.ok(Array.isArray(message.errors), 'Should have errors as array')
		})
	})
})
