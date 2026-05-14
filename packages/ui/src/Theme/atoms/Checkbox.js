import { tokens } from '../tokens.js'

/**
 * Theme definition for Checkbox atom.
 *
 * @typedef {Object} CheckboxTheme
 * @property {string} size
 * @property {string} borderColor
 * @property {string} borderRadius
 * @property {string} borderWidth
 * @property {string} backgroundColor
 * @property {string} checkedColor
 */

/**
 * Checkbox atom theme.
 * @type {CheckboxTheme}
 */
export default {
	size: '1.25rem',
	borderColor: tokens.border.color.default,
	borderRadius: tokens.radius.sm,
	borderWidth: tokens.border.width.sm,
	backgroundColor: tokens.color.background,
	checkedColor: tokens.color.primary,
}
