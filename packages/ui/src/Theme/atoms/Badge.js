import { tokens } from '../tokens.js'

/**
 * Theme definition for Badge atom.
 *
 * @typedef {Object} BadgeTheme
 * @property {string} borderRadius
 * @property {string} fontSize
 * @property {string} paddingX
 * @property {string} paddingY
 * @property {string} fontWeight
 * @property {string} backgroundColor
 * @property {string} color
 */

/**
 * Badge atom theme.
 * @type {BadgeTheme}
 */
export default {
	borderRadius: tokens.radius.full,
	fontSize: tokens.font.size.sm,
	paddingX: tokens.space.sm,
	paddingY: tokens.space.xs,
	fontWeight: tokens.font.weight.bold,
	backgroundColor: tokens.color.primary,
	color: tokens.color.text,
}
