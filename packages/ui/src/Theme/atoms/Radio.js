import { tokens } from '../tokens.js'

/**
 * Theme definition for Radio atom.
 *
 * @typedef {Object} RadioTheme
 * @property {string} size
 * @property {string} borderColor
 * @property {string} borderRadius
 * @property {string} borderWidth
 * @property {string} backgroundColor
 * @property {string} checkedColor
 */

/**
 * Radio atom theme.
 * @type {RadioTheme}
 */
export default {
	size: '1.25rem',
	borderColor: tokens.border.color.default,
	borderRadius: tokens.radius.full,
	borderWidth: tokens.border.width.sm,
	backgroundColor: tokens.color.background,
	checkedColor: tokens.color.primary,
}
