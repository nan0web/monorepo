import Theme from './Theme.js'
import { createTheme } from './createTheme.js'
import * as presets from './presets/index.js'

/**
 * @typedef {{ atoms?: object, molecules?: object, organisms?: object }} UserThemeConfig
 */

/**
 * Returns selected or custom user theme.
 * @param {string | UserThemeConfig} themeNameOrConfig
 * @returns {import('./Theme.js').ThemeConfig}
 */
export function getUserTheme(themeNameOrConfig) {
	if (typeof themeNameOrConfig === 'string') {
		const preset = presets[themeNameOrConfig]
		if (preset) return preset
		throw new Error(`Theme preset "${themeNameOrConfig}" not found.`)
	}

	return createTheme(themeNameOrConfig)
}

/**
 * Custom user theme.
 * Extends the base Theme to allow passing configuration during instantiation.
 * @param {UserThemeConfig} config
 * @returns {import('./Theme.js').ThemeConfig}
 */
export default function CustomTheme(config) {
	return createTheme(config)
}
