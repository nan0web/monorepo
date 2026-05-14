import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import * as presets from './index.js'

describe('Theme presets index', () => {
	it('should export HighContrastTheme', () => {
		assert.ok(presets.HighContrastTheme)
	})
})
