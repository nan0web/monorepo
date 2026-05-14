import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import DarkLightTheme from './DarkLightTheme.js'

describe('DarkLightTheme', () => {
	it('should return light theme when current="light"', () => {
		DarkLightTheme.current = 'light'
		const theme = DarkLightTheme.getActiveTheme()
		assert.deepEqual(theme, DarkLightTheme.light)
	})

	it('should return dark theme when current="dark"', () => {
		DarkLightTheme.current = 'dark'
		const theme = DarkLightTheme.getActiveTheme()
		assert.deepEqual(theme, DarkLightTheme.dark)
	})

	it('should have defined light and dark themes', () => {
		assert.ok(DarkLightTheme.light)
		assert.ok(DarkLightTheme.dark)
	})
})
