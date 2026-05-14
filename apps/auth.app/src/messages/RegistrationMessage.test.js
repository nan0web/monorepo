import { describe, it } from 'node:test'
import assert from 'node:assert'
import RegistrationMessage from './RegistrationMessage.js'

describe('RegistrationMessage', () => {
	it('should create instance with default values', () => {
		const message = new RegistrationMessage()
		assert.strictEqual(message.body.username, '')
		assert.strictEqual(message.body.password, '')
	})

	it('should create instance with provided values', () => {
		const message = new RegistrationMessage({
			body: {
				username: 'testuser',
				password: 'password123',
			},
		})
		assert.strictEqual(message.body.username, 'testuser')
		assert.strictEqual(message.body.password, 'password123')
	})

	it('should convert values to string', () => {
		const message = new RegistrationMessage({
			body: {
				username: 123,
				password: 456,
			},
		})
		assert.strictEqual(message.body.username, '123')
		assert.strictEqual(message.body.password, '456')
	})

	it('should validate username correctly', () => {
		const validUsernames = ['user', 'Test123', 'user_name', 'user-name', 'user.name', 'user@name']
		const invalidUsernames = ['', 'ab', 'user name', 'user#name']

		validUsernames.forEach((username) => {
			const message = new RegistrationMessage({ body: { username } })
			assert.ok(message.isUsernameValid, `Username "${username}" should be valid`)
		})

		invalidUsernames.forEach((username) => {
			const message = new RegistrationMessage({ body: { username } })
			assert.ok(!message.isUsernameValid, `Username "${username}" should be invalid`)
		})
	})

	it('should validate password correctly', () => {
		const validPasswords = ['password', '123456', 'pass•with$symbols', 'longpassword123!@#']
		const invalidPasswords = ['', 'pass', 'pass ', ' password', 'pass word']

		validPasswords.forEach((password) => {
			const message = new RegistrationMessage({ body: { password } })
			assert.ok(message.isPasswordValid, `Password "${password}" should be valid`)
		})

		invalidPasswords.forEach((password) => {
			const message = new RegistrationMessage({ body: { password } })
			assert.ok(!message.isPasswordValid, `Password "${password}" should be invalid`)
		})
	})

	it('should generate proper error messages', () => {
		const emptyMessage = new RegistrationMessage()
		const errors = emptyMessage.errors
		assert.ok(Array.isArray(errors))
		assert.ok(errors.length > 0)
	})

	it('should have no errors when valid', () => {
		const validMessage = new RegistrationMessage({
			body: {
				username: 'testuser',
				password: 'password123',
			},
		})
		const errors = validMessage.errors
		assert.strictEqual(errors.length, 0)
	})

	it('from method should return same instance if already RegistrationMessage', () => {
		const original = new RegistrationMessage()
		const result = RegistrationMessage.from(original)
		assert.strictEqual(result, original)
	})

	it('from method should create new instance from plain object', () => {
		const input = {
			body: {
				username: 'newuser',
				password: 'newpassword',
			},
		}
		const result = RegistrationMessage.from(input)
		assert.ok(result instanceof RegistrationMessage)
		assert.strictEqual(result.body.username, 'newuser')
		assert.strictEqual(result.body.password, 'newpassword')
	})
})
