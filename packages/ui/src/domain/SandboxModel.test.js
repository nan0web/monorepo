import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { SandboxModel } from './SandboxModel.js'

describe('Domain: Sandbox Environment Testing', () => {
	it('SandboxModel coordinates component listing, config tuning, and theme exporting', async () => {
		const sandbox = new SandboxModel({ components: ['Button', 'Table', 'Input'] })
		const iterator = sandbox.run()

		// Breadcrumb log: "Sandbox"
		let intent = await iterator.next()
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.component, 'Breadcrumbs')

		// Step 1: Component Selection
		intent = await iterator.next()
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.component, 'Select')
		assert.deepEqual(intent.value.schema.options, ['Button', 'Table', 'Input'])

		// User selects 'Button'
		intent = await iterator.next({ value: 'Button' })

		// Breadcrumb log: "Sandbox › Button"
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.component, 'Breadcrumbs')
		assert.equal(intent.value.model.path, '/sandbox/Button')

		// Step 2: PropertyEditor (configuring properties)
		intent = await iterator.next()
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.component, 'PropertyEditor')
		assert.ok(intent.value.schema.help.includes('Configure Button properties'))

		// User provides theme tweaks (mocking JSON diff)
		const mockedThemeData = { variant: 'info', size: 'lg', color: '#ff0000' }
		intent = await iterator.next({ value: mockedThemeData })

		// Breadcrumb log: "Sandbox › Button › Export"
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.component, 'Breadcrumbs')
		assert.equal(intent.value.model.path, '/sandbox/Button/export')

		// Step 3: Format Output Selection
		intent = await iterator.next()
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.component, 'Select')
		assert.deepEqual(intent.value.schema.options, ['yaml', 'css', 'json'])

		// User chooses 'css'
		const finalResult = await iterator.next({ value: 'css' })

		// Application Final Result Payload
		assert.equal(finalResult.value.type, 'result')
		assert.equal(finalResult.value.data.component, 'Button')
		assert.equal(finalResult.value.data.exportFormat, 'css')
		assert.deepEqual(finalResult.value.data.themeConfig, mockedThemeData)
		assert.equal(finalResult.value.data.breadcrumb, '/sandbox/Button/export')
	})
})
