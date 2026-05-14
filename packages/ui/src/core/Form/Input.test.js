import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import FormInput from './Input.js'

describe('FormInput', () => {
	it('should create instance with default values', () => {
		const input = new FormInput({ name: 'name' })
		assert.ok(input instanceof FormInput)
		assert.equal(input.type, FormInput.TYPES.TEXT)
		assert.equal(input.required, false)
		assert.equal(input.name, 'name')
		assert.equal(input.placeholder, '')
		assert.deepEqual(input.options, [])
	})

	it('should create instance with custom values', () => {
		const props = {
			type: 'email',
			name: 'email',
			label: 'Email Address',
			required: true,
			placeholder: 'Enter email',
			options: ['option1', 'option2'],
			defaultValue: 'test@example.com',
		}
		const input = new FormInput(props)
		assert.equal(input.type, 'email')
		assert.equal(input.name, 'email')
		assert.equal(input.label, 'Email Address')
		assert.equal(input.required, true)
		assert.equal(input.placeholder, 'Enter email')
		assert.deepEqual(input.options, ['option1', 'option2'])
		assert.equal(input.defaultValue, 'test@example.com')
	})

	it('should create from string', () => {
		const input = FormInput.from('testField')
		assert.equal(input.name, 'testField')
		assert.equal(input.label, 'testField')
	})

	it('should create from object', () => {
		const objInput = { name: 'test', type: 'text' }
		const input = FormInput.from(objInput)
		assert.ok(input instanceof FormInput)
		assert.equal(input.name, 'test')
	})

	it('should validate type', async () => {
		const validInput = new FormInput({ name: 'email', type: 'email' })
		assert.ok(validInput)
		const fn = async () => new FormInput({ name: 'email', type: 'invalid' })
		await assert.rejects(fn, {
			name: 'TypeError',
			message: /FormInput\.type is invalid!/,
		})
	})
})
