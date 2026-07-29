import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { ToolChecker } from '../domain/ToolChecker.js'

describe('ToolChecker', () => {
	it('check — returns true when tool is found', async () => {
		// which node always succeeds
		const result = await ToolChecker.check('node')
		assert.equal(result, true)
	})

	it('check — returns false when tool is not found', async () => {
		const result = await ToolChecker.check('this-tool-does-not-exist-12345')
		assert.equal(result, false)
	})

	it('require — returns empty array when all tools exist', async () => {
		const missing = await ToolChecker.require({
			node: 'install node',
			cat: 'install cat',
		})
		assert.deepEqual(missing, [])
	})

	it('require — returns missing tools with hints', async () => {
		const missing = await ToolChecker.require({
			node: 'already have',
			'does-not-exist-abc': 'install via brew',
		})
		assert.equal(missing.length, 1)
		assert.equal(missing[0].tool, 'does-not-exist-abc')
		assert.equal(missing[0].hint, 'install via brew')
	})

	it('require — handles empty map', async () => {
		const missing = await ToolChecker.require({})
		assert.deepEqual(missing, [])
	})
})