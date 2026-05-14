import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Message from './Message.js'
import InputMessage from './InputMessage.js'

describe('InputMessage', () => {
	it('should create instance with default values', () => {
		const msg = new InputMessage()
		assert.ok(msg instanceof InputMessage)
		assert.deepStrictEqual(msg.value, new Message())
		assert.equal(msg.waiting, false)
		assert.deepEqual(msg.options, [])
	})

	it('should create instance with custom values', () => {
		const props = {
			value: 'user input',
			waiting: true,
			options: ['option1', 'option2'],
		}
		const msg = new InputMessage(props)
		assert.deepStrictEqual(msg.value, Message.from('user input'))
		assert.equal(msg.waiting, true)
		assert.deepEqual(msg.options, ['option1', 'option2'])
	})

	it('should handle string options correctly', () => {
		const msg = new InputMessage({ options: 'single-option' })
		assert.deepEqual(msg.options, ['single-option'])
	})

	it('should detect empty value', () => {
		const emptyMsg = new InputMessage({ value: '' })
		const nonEmptyMsg = new InputMessage({ value: 'test' })
		assert.ok(emptyMsg.empty)
		assert.ok(!nonEmptyMsg.empty)
	})

	it('should validate message', () => {
		const validMsg = new InputMessage({ value: 'test' })
		const invalidMsg = new InputMessage({ value: '' })
		assert.ok(validMsg.isValid)
		assert.ok(!invalidMsg.isValid)
	})
})
