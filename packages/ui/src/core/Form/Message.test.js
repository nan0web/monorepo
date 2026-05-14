import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import FormMessage from './Message.js'

describe('FormMessage', () => {
	it('should create instance with default values', () => {
		const msg = new FormMessage()
		assert.ok(msg instanceof FormMessage)
		assert.deepEqual(msg.data, {})
		assert.deepEqual(msg.schema, {})
		assert.equal(msg.type, 'form')
	})

	it('should create instance with custom values', () => {
		const props = {
			data: { name: 'John' },
			schema: { name: { required: true } },
			body: ['Form content'],
		}
		const msg = new FormMessage(props)
		assert.deepEqual(msg.data, { name: 'John' })
		assert.deepEqual(msg.schema, { name: { required: true } })
		assert.deepEqual(msg.body, ['Form content'])
	})

	it('should add data', () => {
		const msg = new FormMessage({ data: { name: 'John' } })
		const newMsg = msg.addData({ age: 30 })
		assert.deepEqual(newMsg.data, { name: 'John', age: 30 })
	})

	it('should validate data correctly', () => {
		const schema = {
			name: { required: true },
			email: { type: 'email' },
			age: { type: 'number' },
		}
		const msg = new FormMessage({ schema })

		// Valid data
		const validData = { name: 'John', email: 'john@example.com', age: '30' }
		const validResult = msg.validateData(validData)
		assert.ok(validResult.isValid)
		assert.deepEqual(validResult.errors, {})

		// Invalid data
		const invalidData = { email: 'invalid-email', age: 'not-a-number' }
		const invalidResult = msg.validateData(invalidData)
		assert.ok(!invalidResult.isValid)
		assert.ok(invalidResult.errors.name)
		assert.ok(invalidResult.errors.email)
		assert.ok(invalidResult.errors.age)
	})
})
