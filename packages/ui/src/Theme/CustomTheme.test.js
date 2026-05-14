import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CustomTheme, { getUserTheme } from './CustomTheme.js'
import HighContrastTheme from './presets/HighContrastTheme.js'

describe('CustomTheme', () => {
	it('should create custom theme from config', () => {
		const config = {
			atoms: { Button: { color: 'red' } },
			color: { background: 'black' },
		}
		const theme = new CustomTheme(config)
		assert.ok(theme.atoms)
		assert.ok(theme.color)
	})

	it('getUserTheme should return CustomTheme from config', () => {
		const config = { color: { background: 'blue' } }
		const theme = getUserTheme(config)
		assert.equal(theme.color.background, 'blue')
	})
})
