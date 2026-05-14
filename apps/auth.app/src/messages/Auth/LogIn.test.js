import { describe, it } from 'node:test'
import assert from 'node:assert'
import LogIn, { LogInBody } from './LogIn.js'

describe('LogInBody', () => {
	it('should create instance with default values', () => {
		const body = new LogInBody()
		assert.strictEqual(body.identifier, '')
		assert.strictEqual(body.password, '')
		assert.strictEqual(body.remember, false)
	})

	it('should validate identifier correctly', () => {
		const validIdentifier = LogInBody.identifier.validation('username')
		assert.strictEqual(validIdentifier, true)

		const shortIdentifier = LogInBody.identifier.validation('ab')
		assert.strictEqual(shortIdentifier, LogInBody.ERRORS.identifierMin)

		const invalidIdentifier = LogInBody.identifier.validation('user name')
		assert.strictEqual(invalidIdentifier, LogInBody.ERRORS.identifierOnly)

		assert.strictEqual(LogInBody.identifier.validation('user123'), true)
		assert.strictEqual(LogInBody.identifier.validation('user_name'), true)
		assert.strictEqual(LogInBody.identifier.validation('user-name'), true)
		assert.strictEqual(LogInBody.identifier.validation('user@example.com'), true)
	})

	it('should validate password correctly', () => {
		const validPassword = LogInBody.password.validation('password123')
		assert.strictEqual(validPassword, true)

		const shortPassword = LogInBody.password.validation('12345')
		assert.deepStrictEqual(shortPassword, [LogInBody.ERRORS.passwordMin])

		const spacePassword = LogInBody.password.validation('pass word')
		assert.deepStrictEqual(spacePassword, [LogInBody.ERRORS.passwordOnly])

		const multipleErrors = LogInBody.password.validation('1 ')
		assert.deepStrictEqual(multipleErrors, [
			LogInBody.ERRORS.passwordMin,
			LogInBody.ERRORS.passwordOnly,
		])
	})
})

describe('LogIn', () => {
	it('should create instance with default values', () => {
		const message = new LogIn()
		assert.ok(message.body instanceof LogInBody)
		assert.strictEqual(message.body.identifier, '')
		assert.strictEqual(message.body.password, '')
		assert.strictEqual(message.body.remember, false)
	})

	it('should create instance with provided values', () => {
		const message = new LogIn({
			body: {
				identifier: 'testuser',
				password: 'password123',
				remember: true,
			},
		})
		assert.strictEqual(message.body.identifier, 'testuser')
		assert.strictEqual(message.body.password, 'password123')
		assert.strictEqual(message.body.remember, true)
	})

	it('should validate correctly with valid input', () => {
		const message = new LogIn({
			body: {
				identifier: 'testuser',
				password: 'password123',
			},
		})
		assert.ok(message.isValid)
	})

	it('should fail validation with empty identifier', () => {
		const message = new LogIn({
			body: {
				identifier: '',
				password: 'password123',
			},
		})
		assert.ok(!message.isValid)
	})

	it('should fail validation with empty password', () => {
		const message = new LogIn({
			body: {
				identifier: 'testuser',
				password: '',
			},
		})
		assert.ok(!message.isValid)
	})

	it('should have proper UI labels and placeholders', () => {
		assert.strictEqual(LogInBody.identifier.label, 'Identifier')
		assert.strictEqual(LogInBody.identifier.placeholder, 'username or email@example.com')
		assert.strictEqual(LogInBody.password.label, 'Password')
	})

	it('from method should return same instance if already LogIn', () => {
		const original = new LogIn()
		const result = LogIn.from(original)
		assert.strictEqual(result, original)
	})

	it('from method should create new instance from plain object', () => {
		const input = {
			body: {
				identifier: 'newuser',
				password: 'newpassword',
			},
		}
		const result = LogIn.from(input)
		assert.ok(result instanceof LogIn)
		assert.strictEqual(result.body.identifier, 'newuser')
		assert.strictEqual(result.body.password, 'newpassword')
	})

	it('should return errors for invalid fields', () => {
		const msg = new LogIn({ body: { identifier: 'ab', password: '12345' } })
		const errors = msg.errors
		assert.ok(Array.isArray(errors))
		assert.ok(errors.includes('Identifier must be at least 3 characters'))
		assert.ok(errors.includes('Password must be at least 6 characters'))
	})

	it('should return empty errors for valid fields', () => {
		const body = new LogIn({ body: { identifier: 'username', password: '123456' } })
		const errors = body.errors // Fixed property access
		assert.deepStrictEqual(errors, [])
	})
})
