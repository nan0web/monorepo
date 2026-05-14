import { describe, it } from 'node:test'
import assert from 'node:assert'
import SignUpMessage from './SignUpMessage.js'

describe('SignUpMessage', () => {
	it('should create instance with default values', () => {
		const message = new SignUpMessage()
		assert.strictEqual(message.body.email, '')
		assert.strictEqual(message.body.password, '')
		assert.strictEqual(message.body.username, '')
	})

	it('should create instance with provided values', () => {
		const message = new SignUpMessage({
			body: {
				email: 'test@example.com',
				password: 'password123',
				username: 'testuser',
			},
		})
		assert.strictEqual(message.body.email, 'test@example.com')
		assert.strictEqual(message.body.password, 'password123')
		assert.strictEqual(message.body.username, 'testuser')
	})

	it('should convert values to string', () => {
		const message = new SignUpMessage({
			body: {
				email: 123,
				password: 456,
				username: 789,
			},
		})
		assert.strictEqual(message.body.email, '123')
		assert.strictEqual(message.body.password, '456')
		assert.strictEqual(message.body.username, '789')
	})

	it('should validate correctly with valid input', () => {
		const message = new SignUpMessage({
			body: {
				email: 'test@example.com',
				password: 'password123',
				username: 'testuser',
			},
		})
		assert.ok(message.isValid)
		assert.strictEqual(message.errors.length, 0)
	})

	it('should fail validation with empty email', () => {
		const message = new SignUpMessage({
			body: {
				email: '',
				password: 'password123',
				username: 'testuser',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(message.errors.some((e) => e === 'Email is required'))
	})

	it('should fail validation with invalid email format', () => {
		const message = new SignUpMessage({
			body: {
				email: 'invalid-email',
				password: 'password123',
				username: 'testuser',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(message.errors.some((e) => e === 'Email is invalid'))
	})

	it('should fail validation with short password', () => {
		const message = new SignUpMessage({
			body: {
				email: 'test@example.com',
				password: 'pass',
				username: 'testuser',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(
			message.errors.some(
				(e) =>
					Array.isArray(e) &&
					e[0] === 'Password must be at least {{min}} characters' &&
					e[1].min === 8,
			),
		)
	})

	it('should fail validation with short username', () => {
		const message = new SignUpMessage({
			body: {
				email: 'test@example.com',
				password: 'password123',
				username: 'ab',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(
			message.errors.some(
				(e) =>
					Array.isArray(e) &&
					e[0] === 'Username must be at least {{min}} characters' &&
					e[1].min === 3,
			),
		)
	})

	it('should have proper UI labels and placeholders', () => {
		const message = new SignUpMessage()
		assert.strictEqual(message.emailLabel, 'Email')
		assert.strictEqual(message.emailPlaceholder, 'john.doe@example.com')
		assert.strictEqual(message.passwordLabel, 'Password')
		assert.strictEqual(message.usernameLabel, 'Username')
	})

	it('from method should return same instance if already SignUpMessage', () => {
		const original = new SignUpMessage()
		const result = SignUpMessage.from(original)
		assert.strictEqual(result, original)
	})

	it('from method should create new instance from plain object', () => {
		const input = {
			body: {
				email: 'new@example.com',
				password: 'newpassword',
				username: 'newuser',
			},
		}
		const result = SignUpMessage.from(input)
		assert.ok(result instanceof SignUpMessage)
		assert.strictEqual(result.body.email, 'new@example.com')
		assert.strictEqual(result.body.password, 'newpassword')
		assert.strictEqual(result.body.username, 'newuser')
	})
})
