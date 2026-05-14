import { tokens } from '../tokens.js'

/**
 * Theme definition for Modal organism.
 *
 * @typedef {Object} ModalTheme
 * @property {string} overlayBackground
 * @property {string} borderRadius
 * @property {string} boxShadow
 * @property {string} padding
 * @property {string} backgroundColor
 */

/**
 * Modal organism theme.
 * @type {ModalTheme}
 */
export default {
	overlayBackground: 'rgba(0, 0, 0, 0.5)',
	borderRadius: tokens.radius.lg,
	boxShadow: tokens.shadow.lg,
	padding: tokens.space.xl,
	backgroundColor: tokens.color.background,
}
