import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import OutputAdapter from './OutputAdapter.js'

describe('OutputAdapter', () => {
	it('should create instance', () => {
		const adapter = new OutputAdapter()
		assert.ok(adapter instanceof OutputAdapter)
	})

	it('should throw error on render method', () => {
		const adapter = new OutputAdapter()
		assert.throws(() => adapter.render(), {
			message: 'render() must be implemented by subclass',
		})
	})

	it('should call render on progress', () => {
		const adapter = new OutputAdapter()
		let rendered = false

		// Override render for test
		adapter.render = () => {
			rendered = true
		}

		adapter.progress(0.5)
		assert.ok(rendered)
	})

	it('should stop without error', () => {
		const adapter = new OutputAdapter()
		assert.doesNotThrow(() => adapter.stop())
	})
})
