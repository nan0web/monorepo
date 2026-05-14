import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'
import { ModelAsApp } from '../domain/ModelAsApp.js'
import { InputModel } from '../domain/components/InputModel.js'
import { ConfirmModel } from '../domain/components/ConfirmModel.js'
import { SelectModel } from '../domain/components/SelectModel.js'
import { ask, result, progress, show } from '../core/Intent.js'
import { ScenarioTest } from './ScenarioTest.js'

describe('ScenarioTest - Comprehensive Capabilities', () => {
	it('Successfully handles complex multi-step scenario', async () => {
		class ShoppingCartApp extends ModelAsApp {
			*run() {
				yield progress('Starting checkout')
				yield show('User initiated checkout', 'info')

				const { value: product } = yield ask(
					'product',
					new SelectModel({
						help: 'Select Product',
						label: 'Select Product',
						options: [
							{ value: 'laptop', label: 'Laptop' },
							{ value: 'mouse', label: 'Mouse' },
						],
					}),
				)

				const { value: confirm } = yield ask(
					'confirm',
					new ConfirmModel({
						help: 'Confirm',
						title: `Confirm purchase of ${product}?`,
					}),
				)

				if (!confirm) {
					return result({ success: false, reason: 'cancelled' })
				}

				return result({ success: true, product })
			}
		}

		// Scenario: User selects 'laptop' and confirms
		const res1 = await ScenarioTest.run(ShoppingCartApp, [
			{ field: 'product', value: 'laptop' },
			{ field: 'confirm', value: true },
		])

		assert.equal(res1.error, undefined)
		assert.deepEqual(res1.value, { success: true, product: 'laptop' })
		// Verify intents sequence
		assert.equal(res1.intents.length, 5)
		assert.equal(res1.intents[0].type, 'progress')
		assert.equal(res1.intents[1].type, 'show')
		assert.equal(res1.intents[2].type, 'ask')
		assert.equal(res1.intents[2].field, 'product')
		assert.equal(res1.intents[3].type, 'ask')
		assert.equal(res1.intents[3].field, 'confirm')
		assert.equal(res1.intents[4].type, 'result')

		// Scenario: User selects 'mouse' and cancels
		const res2 = await ScenarioTest.run(ShoppingCartApp, [
			{ field: 'product', value: 'mouse' },
			{ field: 'confirm', value: false },
		])

		assert.deepEqual(res2.value, { success: false, reason: 'cancelled' })
	})

	it('Handles default values for missing answers gracefully', async () => {
		class QuickApp extends ModelAsApp {
			*run() {
				const { value: item } = yield ask('item', { help: 'Item' })
				return result({ item })
			}
		}

		// Providing empty scenario, askIntent should return { value: null }
		const res = await ScenarioTest.run(QuickApp, [])
		assert.deepEqual(res.value, { item: null })
	})

	it('Handles intentional interaction cancellation', async () => {
		class CancellableApp extends ModelAsApp {
			*run() {
				try {
					yield ask('mandatoryField', { help: 'Required' })
				} catch (err) {
					if (err.name === 'CancelError') {
						return result({ aborted: true })
					}
					throw err
				}
				return result({ aborted: false })
			}
		}

		// Simulating user clicking ESC/Cancel on the prompt
		const res = await ScenarioTest.run(CancellableApp, [
			{ field: 'mandatoryField', value: null, cancelled: true },
		])

		assert.deepEqual(res.value, { aborted: true })
	})
})
