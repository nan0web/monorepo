import { describe, it } from 'node:test'
import assert from 'node:assert'
import ConfirmSignUpMessage from './ConfirmSignUpMessage.js'

describe('ConfirmSignUpMessage', () => {
	it('should create instance with default values', () => {
		const message = new ConfirmSignUpMessage()
		assert.strictEqual(message.body.contact, '')
		assert.strictEqual(message.body.code, '')
	})

	it('should create instance with provided values', () => {
		const message = new ConfirmSignUpMessage({
			body: {
				contact: 'test@example.com',
				code: '123456',
			},
		})
		assert.strictEqual(message.body.contact, 'test@example.com')
		assert.strictEqual(message.body.code, '123456')
	})

	it('should convert values to string', () => {
		const message = new ConfirmSignUpMessage({
			body: {
				contact: 123,
				code: 456,
			},
		})
		assert.strictEqual(message.body.contact, '123')
		assert.strictEqual(message.body.code, '456')
	})

	it('should validate correctly with valid input', () => {
		const message = new ConfirmSignUpMessage({
			body: {
				contact: 'test@example.com',
				code: '123456',
			},
		})
		assert.ok(message.isValid)
		assert.strictEqual(message.errors.length, 0)
	})

	it('should fail validation with empty contact', () => {
		const message = new ConfirmSignUpMessage({
			body: {
				contact: '',
				code: '123456',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(message.errors.some((e) => e === 'Contact is required'))
	})

	it('should fail validation with empty code', () => {
		const message = new ConfirmSignUpMessage({
			body: {
				contact: 'test@example.com',
				code: '',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(message.errors.some((e) => e === 'Code is required'))
	})

	it('should fail validation with short code', () => {
		const message = new ConfirmSignUpMessage({
			body: {
				contact: 'test@example.com',
				code: '123',
			},
		})
		assert.ok(!message.isValid)
		assert.ok(
			message.errors.some(
				(e) =>
					Array.isArray(e) && e[0] === 'Code must be at least {{min}} characters' && e[1].min === 6,
			),
		)
	})

	it('should have proper UI labels and placeholders', () => {
		const message = new ConfirmSignUpMessage()
		assert.strictEqual(message.contactLabel, 'Contact')
		assert.strictEqual(message.contactPlaceholder, 'email@example.com or +1234567890')
		assert.strictEqual(message.codeLabel, 'Confirmation code')
		assert.strictEqual(message.codePlaceholder, '123456')
	})

	it('from method should return same instance if already ConfirmSignUpMessage', () => {
		const original = new ConfirmSignUpMessage()
		const result = ConfirmSignUpMessage.from(original)
		assert.strictEqual(result, original)
	})

	it('from method should create new instance from plain object', () => {
		const input = {
			body: {
				contact: 'confirm@example.com',
				code: '789012',
			},
		}
		const result = ConfirmSignUpMessage.from(input)
		assert.ok(result instanceof ConfirmSignUpMessage)
		assert.strictEqual(result.body.contact, 'confirm@example.com')
		assert.strictEqual(result.body.code, '789012')
	})
})
