import { tokens } from '../tokens.js'

/**
 * Theme definition for Card molecule.
 *
 * @typedef {Object} CardTheme
 * @property {string} borderRadius
 * @property {string} boxShadow
 * @property {string} padding
 * @property {string} backgroundColor
 * @property {string} borderColor
 */

/**
 * Card molecule theme.
 * @type {CardTheme}
 */
export default {
	borderRadius: tokens.radius.lg,
	boxShadow: tokens.shadow.md,
	padding: tokens.space.lg,
	backgroundColor: tokens.color.background,
	borderColor: tokens.border.color.muted,
}
