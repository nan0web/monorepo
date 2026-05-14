import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { ButtonModel, ConfirmModel, InputModel, SpinnerModel, TableModel, ToastModel } from './index.js'

describe('Domain: OLMUI Components (Phase 1)', () => {
	it('ButtonModel is a valid generator returning schema and defaults', async () => {
		const btn = new ButtonModel({ content: 'Accept' })
		assert.equal(btn.content, 'Accept')
		assert.equal(btn.variant, 'primary') // default fallback
		assert.equal(ButtonModel.variant.options.includes('ghost'), true)

		const iterator = btn.run()
		const askIntent = await iterator.next()
		assert.equal(askIntent.value.type, 'ask')
		assert.equal(askIntent.value.component, 'Button')
		assert.equal(askIntent.value.field, 'clicked')

		const result = await iterator.next({ value: { clicked: true } })
		assert.equal(result.value.type, 'result')
		assert.equal(result.value.data.clicked, true)
	})

	it('InputModel enforces pattern validation constraint from schema', async () => {
		const input = new InputModel({ 
			label: 'Kode', 
			pattern: '[A-Z]{3}',
			required: true 
		})
		
		assert.equal(input.label, 'Kode')
		
		const iterator = input.run()
		const askIntent = await iterator.next()
		assert.equal(askIntent.value.field, 'content')
		
		const validateFn = askIntent.value.schema.validate
		assert.ok(typeof validateFn === 'function')
		
		// Validate against constraints
		assert.notEqual(validateFn(''), true) // Should fail (required)
		assert.notEqual(validateFn('abc'), true) // Should fail ([A-Z]{3})
		assert.equal(validateFn('ABC'), true) // Should pass
		
		const result = await iterator.next({ value: 'ABC' })
		assert.equal(result.value.data.value, 'ABC')
		assert.equal(input.content, 'ABC') 
	})

	it('ConfirmModel yields boolean confirmation', async () => {
		const dialog = new ConfirmModel({ message: 'Delete?' })
		const iterator = dialog.run()
		
		const askIntent = await iterator.next()
		assert.equal(askIntent.value.type, 'ask')
		assert.equal(askIntent.value.component, 'Confirm')
		assert.equal(askIntent.value.schema.type, 'boolean')
		
		const result = await iterator.next({ value: true })
		assert.equal(result.value.data.confirmed, true)
	})

	it('SpinnerModel yields immediate progress intent without ask', async () => {
		const spinner = new SpinnerModel({ size: 'lg' })
		const iterator = spinner.run()
		
		const progIntent = await iterator.next()
		assert.equal(progIntent.value.type, 'progress')
		assert.equal(progIntent.value.component, 'Spinner')
		
		const result = await iterator.next()
		assert.equal(result.done, true)
	})
	
	it('ToastModel yields show intent mapped to correct severity level', async () => {
		const toast = new ToastModel({ variant: 'error', duration: 0 })
		const iterator = toast.run()
		
		const showIntent = await iterator.next()
		assert.equal(showIntent.value.type, 'show')
		assert.equal(showIntent.value.level, 'error')
		assert.equal(showIntent.value.component, 'Toast')
		
		const result = await iterator.next()
		assert.equal(result.done, true)
	})

	it('TableModel yields show reporting data size immediately', async () => {
		const table = new TableModel({ rows: [['A'], ['B'], ['C']] })
		const iterator = table.run()
		
		const showIntent = await iterator.next()
		assert.equal(showIntent.value.type, 'show')
		assert.equal(showIntent.value.component, 'Table')
		
		const result = await iterator.next()
		assert.equal(result.value.data.rowsCount, 3)
	})
})
