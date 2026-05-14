import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import SimpleApp from './SimpleApp.js'
import DB from '@nan0web/db'

const mockInput = { db: new DB(), title: 'Test', uri: '/test' }

describe('SimpleApp', () => {
	/**
	 * @todo fix the issue with the proper DB version in dependency to understand instanceof
	 */
	it.skip('run() returns standard data structure', async () => {
		const app = new SimpleApp({ ...mockInput, db: new DB() })
		const result = await app.run()

		assert.strictEqual(result.type, 'standard')
		assert.ok(Array.isArray(result.content))
		assert.ok(result.content[0].Typography)
		assert.ok(result.content[2].Button)
	})

	/**
	 * @todo fix the issue with the proper DB version in dependency to understand instanceof
	 */
	it.skip('simulates async delay', async () => {
		const start = Date.now()
		const app = new SimpleApp({ ...mockInput, db: new DB() })
		await app.run()
		const end = Date.now()
		assert.ok(end - start >= 3000 - 100) // ~3s
	})

	/**
	 * @todo fix the issue with the proper DB version in dependency to understand instanceof
	 */
	it.skip('from() creates instance', () => {
		const app = SimpleApp.from(mockInput)
		assert.ok(app instanceof SimpleApp)
		assert.strictEqual(app.uri, '/test')
		assert.strictEqual(app.db.constructor.name, 'DB')
	})
})
