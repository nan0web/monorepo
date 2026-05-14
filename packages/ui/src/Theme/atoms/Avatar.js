import { tokens } from '../tokens.js'

/**
 * Theme definition for Avatar atom.
 *
 * @typedef {Object} AvatarTheme
 * @property {string} size
 * @property {string} borderRadius
 * @property {string} border
 */

/**
 * Avatar atom theme.
 * @type {AvatarTheme}
 */
export default {
	size: '2.5rem',
	borderRadius: tokens.radius.full,
	border: `${tokens.border.width.sm} solid ${tokens.border.color.default}`,
}
