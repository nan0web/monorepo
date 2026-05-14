import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '../../../../packages/db/src/DB/DB.js'

describe('v3.0.0: Monorepo Unification & DB Intelligence', () => {
	it('DB.browse() should support "ignore" option to filter out node_modules', async () => {
		const db = new DB({
			predefined: [
				['src/index.js', 'console.log("hello")'],
				['node_modules/dep/index.js', 'module.exports = {}'],
				['.git/config', '[core]'],
			],
		})
		await db.connect()

		const files = []
		// Here we test the new "ignore" option
		for await (const entry of db.browse('.', { ignore: ['node_modules', '.git'] })) {
			files.push(entry.path)
		}

		assert.ok(files.includes('src/index.js'), 'Should include src/index.js')
		assert.ok(!files.includes('node_modules/dep/index.js'), 'Should ignore node_modules')
		assert.ok(!files.includes('.git/config'), 'Should ignore .git')
	})

	it('All packages should have version 3.0.0 after unification', async () => {
		// This is a placeholder for the future check after bump.js
		// For now it might fail or we skip it until bump is done
	})
})
