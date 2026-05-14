import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { ShowcaseAppModel } from './ShowcaseAppModel.js'

describe('Domain: OLMUI Application Scenario Testing (Phase 2)', () => {
	it('ShowcaseAppModel completes full user journey traversing all components', async () => {
		const app = new ShowcaseAppModel()
		const iterator = app.run()

		// Step 1: Click the Start Button
		let intent = await iterator.next()
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.component, 'Button')

		// Confirm the button click
		intent = await iterator.next({ value: { clicked: true } })

		// Step 2: Profile Form (Model-as-Schema — full form intent)
		assert.equal(intent.value.type, 'ask')
		assert.ok(intent.value.model) // has model instance
		assert.ok(intent.value.schema) // has schema class
		assert.equal(intent.value.field, 'profile_form')

		// Submit form with collected data (alias 'name' → canonical 'profileName')
		intent = await iterator.next({ value: { name: 'Yaroslav', role: 'Developer', tool: 'Node.js' }, cancelled: false })

		// Step 3: Confirmation dialog
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.component, 'Confirm')

		intent = await iterator.next({ value: true })

		// Step 4: Spinner (progress)
		assert.equal(intent.value.type, 'progress')
		assert.equal(intent.value.component, 'Spinner')

		intent = await iterator.next() // Spinner completes

		// Step 5: Success Toast
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.component, 'Toast')
		assert.equal(intent.value.level, 'info')

		intent = await iterator.next() // Toast completes

		// Step 6: Result Table
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.component, 'Table')
		assert.equal(intent.value.model.rows.length, 4)

		// Final Generator return
		const finalResult = await iterator.next()
		assert.equal(finalResult.value.type, 'result')
		assert.equal(finalResult.value.data.success, true)
		assert.equal(finalResult.value.data.rowsDisplayed, 4)
	})

	it('ShowcaseAppModel gracefully aborts when user cancels at Confirm step', async () => {
		const app = new ShowcaseAppModel()
		const iterator = app.run()

		await iterator.next() // to Button
		await iterator.next({ value: { clicked: true } }) // to Profile Form
		let intent = await iterator.next({ value: { name: 'Yaroslav', role: 'Developer', tool: 'Node.js' }, cancelled: false }) // to Confirm

		assert.equal(intent.value.component, 'Confirm')

		// User clicks 'Cancel' (sends false)
		intent = await iterator.next({ value: false })

		// Application should yield a Toast message
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.component, 'Toast')
		assert.equal(intent.value.level, 'info') // 'cancelled' variant is 'info'

		// Final return is a failure result
		const finalResult = await iterator.next()
		assert.equal(finalResult.value.type, 'result')
		assert.equal(finalResult.value.data.success, false)
		assert.equal(finalResult.value.data.reason, 'user_aborted')
	})
})
