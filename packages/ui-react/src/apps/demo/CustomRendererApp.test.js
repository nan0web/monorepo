import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import CustomRendererApp from './CustomRendererApp.js'

const mockInput = { db: new DB(), title: 'Test', uri: '/test' }

describe('CustomRendererApp (UI-Agnostic)', () => {
	/**
	 * @todo fix the issue with the proper DB version in dependency to understand instanceof
	 */
	it.skip('run() returns agnostic data without JSX', async () => {
		const app = new CustomRendererApp(mockInput)
		const result = await app.run()

		assert.strictEqual(result.type, 'interactive')
		assert.ok(result.requiresInput)
		assert.strictEqual(result.requiresInput.fields.length, 1)
		assert.strictEqual(result.requiresInput.fields[0].name, 'count')
		assert.ok(typeof result.compute === 'function')
		assert.ok(Array.isArray(result.content))
		assert.ok(result.content[0].Typography)

		// Verify no JSX
		assert.strictEqual(result.Renderer, undefined)
	})

	/**
	 * @todo fix the issue with the proper DB version in dependency to understand instanceof
	 */
	it.skip('compute function processes input correctly', async () => {
		const app = new CustomRendererApp(mockInput)
		const result = await app.run()
		const computed = result.compute({ count: 5 })

		assert.strictEqual(computed.$title, 'Result: 10')
		assert.strictEqual(computed.message, 'Computed from 5 → 10')
		assert.ok(Array.isArray(computed.updatedContent))
	})

	/**
	 * @todo fix the issue with the proper DB version in dependency to understand instanceof
	 */
	it.skip('from() creates instance correctly', () => {
		const app = CustomRendererApp.from(mockInput)
		assert.ok(app instanceof CustomRendererApp)
		assert.strictEqual(app.title, 'Test')
	})
})
