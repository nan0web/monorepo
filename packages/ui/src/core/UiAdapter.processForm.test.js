import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import UiAdapter from './UiAdapter.js'
import UIForm from './Form/Form.js'
import FormInput from './Form/Input.js'

describe('UiAdapter.processForm()', () => {
	it('should process a form and return the form instance', async () => {
		const adapter = new UiAdapter()
		const form = new UIForm({
			fields: [new FormInput({ name: 'field1', label: 'Field 1' })],
			state: { field1: 'value1' },
		})

		const result = await adapter.processForm(form, { field1: 'override' })
		assert.ok(result)
		assert.ok(result.form instanceof UIForm)
		// The default implementation merges the initial state into the form state.
		assert.deepEqual(result.form.state, { field1: 'override' })
	})
})
