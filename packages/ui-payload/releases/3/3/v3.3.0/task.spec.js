import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { uiPayloadRegistry } from '../../../../src/uiPayloadRegistry.js'

describe('Release v3.3.0: @nan0web/ui-payload Contract', () => {
	it('uiPayloadRegistry provides polymorphic lookup for block views', () => {
		class MockModel {}
		class MockView {}
		uiPayloadRegistry.set(MockModel, MockView)

		assert.equal(uiPayloadRegistry.get(MockModel), MockView)
	})
})
