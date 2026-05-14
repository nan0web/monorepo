import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { App } from '@nan0web/ui'

describe('App', () => {
	it('should be defined', () => {
		assert.ok(App)
		assert.ok(App.Core)
		assert.ok(App.User)
		assert.ok(App.Scenario)
		assert.ok(App.UI)
	})
})
