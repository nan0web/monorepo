import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import HighContrastTheme from './HighContrastTheme.js'

describe('HighContrastTheme', () => {
	it('should have defined colors', () => {
		assert.ok(HighContrastTheme.atoms.Button.color)
		assert.ok(HighContrastTheme.atoms.Button.solid)
	})
})
