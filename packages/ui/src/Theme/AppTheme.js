import Theme from './Theme.js'

/**
 * Base application theme.
 * Should be extended by app-specific themes.
 *
 * @typedef {import("./Theme.js").ThemeConfig & { fontFamily?: string }} AppThemeConfig
 */

/**
 * Base application theme.
 * Should be extended by app-specific themes.
 *
 * @type {AppThemeConfig}
 */
export default {
	...Theme,
	fontFamily: 'system-ui',
}
