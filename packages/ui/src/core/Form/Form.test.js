import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import UIForm from './Form.js'
import FormInput from './Input.js'

describe('UIForm', () => {
	it('should create instance with default values', () => {
		const form = new UIForm()
		assert.ok(form instanceof UIForm)
		assert.equal(form.title, '')
		assert.deepEqual(form.fields, [])
		assert.deepEqual(form.state, {})
	})

	it('should create instance with custom values', () => {
		const fields = [
			new FormInput({ name: 'name', label: 'Name', required: true }),
			new FormInput({ name: 'email', label: 'Email', type: 'email' }),
		]
		const props = {
			title: 'Test Form',
			fields,
			state: { name: 'John' },
		}
		const form = new UIForm(props)
		assert.equal(form.title, 'Test Form')
		assert.equal(form.fields.length, 2)
		assert.deepEqual(form.state, { name: 'John' })
	})

	it('should set data', () => {
		const form = new UIForm({ state: { name: 'John' } })
		const newForm = form.setData({ email: 'john@example.com' })
		assert.deepEqual(newForm.state, { name: 'John', email: 'john@example.com' })
	})

	it('should get field by name', () => {
		const fields = [new FormInput({ name: 'test', label: 'Test Field' })]
		const form = new UIForm({ fields })
		const field = form.getField('test')
		assert.ok(field)
		assert.equal(field.name, 'test')
	})

	it('should get values', () => {
		const form = new UIForm({ state: { name: 'John', age: 30 } })
		const values = form.getValues()
		assert.deepEqual(values, { name: 'John', age: 30 })
	})

	it('should validate form', () => {
		const fields = [new FormInput({ name: 'requiredField', required: true })]
		const form = new UIForm({ fields, state: {} })
		const result = form.validate()
		assert.ok(!result.isValid)
		assert.ok(result.errors.requiredField)
	})

	it('should validate individual field', () => {
		const fields = [new FormInput({ name: 'email', type: 'email' })]
		const form = new UIForm({ fields })
		const result = form.validateField('email', 'invalid-email')
		assert.ok(!result.isValid)
		assert.ok(result.errors.email)
	})

	it('should convert to JSON', () => {
		const form = new UIForm({ title: 'Test', state: { name: 'John' } })
		const json = form.toJSON()
		assert.ok(json.id)
		assert.equal(json.title, 'Test')
		assert.ok(Array.isArray(json.fields))
		assert.ok(json.state)
		assert.ok(json.meta)
	})

	it('parses default text fields', () => {
		const data = { name: '', email: '' }
		const { fields } = UIForm.parse(data)
		assert.equal(fields.length, 2)
		assert.ok(fields[0] instanceof FormInput)
		assert.equal(fields[0].name, 'name')
		assert.equal(fields[0].label, 'Name')
		assert.equal(fields[0].type, FormInput.TYPES.TEXT)
		assert.equal(fields[0].required, false)
	})

	it('applies overrides correctly', () => {
		const data = { age: '' }
		const { fields } = UIForm.parse(data, {
			age: { type: FormInput.TYPES.NUMBER, required: true, label: 'User Age' },
		})
		const ageField = fields[0]
		assert.equal(ageField.type, FormInput.TYPES.NUMBER)
		assert.ok(ageField.required)
		assert.equal(ageField.label, 'User Age')
	})

	it('supports static custom validations', () => {
		// register a validation that ensures a string contains only digits
		UIForm.addValidation('digitsOnly', (value) => {
			return /^\d+$/.test(value) ? true : 'Must contain only digits'
		})

		const fields = [new FormInput({ name: 'phone', label: 'Phone', required: true })]
		const schema = {
			phone: { validation: 'digitsOnly' },
		}
		const form = new UIForm({ fields, schema, state: { phone: '12a34' } })
		const result = form.validate()
		assert.ok(!result.isValid)
		assert.equal(result.errors.phone, 'Must contain only digits')
	})
})
