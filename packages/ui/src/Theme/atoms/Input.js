import { tokens } from '../tokens.js'

/**
 * Theme definition for Input atom.
 *
 * @typedef {Object} InputTheme
 * @property {string} borderRadius
 * @property {string} borderWidth
 * @property {string} borderColor
 * @property {string} fontSize
 * @property {string} paddingX
 * @property {string} paddingY
 * @property {string} fontFamily
 */

/**
 * Input atom theme.
 * @type {InputTheme}
 */
export default {
	borderRadius: tokens.radius.md,
	borderWidth: tokens.border.width.md,
	borderColor: tokens.border.color.default,
	fontSize: tokens.font.size.base,
	paddingX: tokens.space.lg,
	paddingY: tokens.space.md,
	fontFamily: tokens.font.family,
}
