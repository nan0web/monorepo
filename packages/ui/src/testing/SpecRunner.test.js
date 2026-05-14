import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SpecRunner } from './SpecRunner.js'
import { ModelAsApp, ask, show, result } from '../index.js'

class ShoppingCartApp extends ModelAsApp {
	async *run() {
		const { value: res1 } = yield ask('product', { help: 'Select product' })
		yield show('Good choice!')
		const { value: res2 } = yield ask('confirm', { help: 'Confirm?' })
		return result({
			product: res1,
			confirm: res2,
		})
	}
}

describe('SpecRunner', () => {
	it('should run a valid Nan0Spec stream successfully', async () => {
		const stream = [
			{ ShoppingCartApp: { userId: '123' } },
			{ ask: 'product', $value: 'laptop' },
			{ show: 'Good choice!' },
			{ ask: 'confirm', $value: true },
			{ result: { product: 'laptop', confirm: true } }
		]

		const registry = { ShoppingCartApp }
		await assert.doesNotReject(SpecRunner.execute(stream, registry))
	})

	it('should fail if intent field mismatches', async () => {
		const stream = [
			{ ShoppingCartApp: {} },
			{ ask: 'wrong_field', $value: 'laptop' }
		]
		
		await assert.rejects(
			SpecRunner.execute(stream, { ShoppingCartApp }),
			/Field mismatch on ask/
		)
	})

	it('should fail if stream expected show but got ask', async () => {
		const stream = [
			{ ShoppingCartApp: {} },
			{ show: 'Hey' }
		]

		await assert.rejects(
			SpecRunner.execute(stream, { ShoppingCartApp }),
			/Strict mismatch: Model yielded 'ask'/
		)
	})
})
