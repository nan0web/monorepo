import Input from './Input.js'
import { tokens } from '../tokens.js'

/**
 * Theme definition for Button atom.
 * Inherits common properties from Input and defines colour and shadow.
 *
 * @typedef {Object} ButtonTheme
 * @property {string} color
 * @property {string} background
 * @property {string} shadow
 * @property {string} hoverBackground
 * @property {Object} solid
 * @property {Object} outline
 * @property {Object} size
 * @property {Object} animation
 * @property {string} borderColor
 * @property {string} borderRadius
 * @property {string} borderWidth
 * @property {string} fontSize
 * @property {string} paddingX
 * @property {string} paddingY
 */

/**
 * Button atom theme.
 * @type {ButtonTheme}
 */
export default {
	...Input,
	color: tokens.color.text,
	background: tokens.color.primary,
	shadow: tokens.shadow.sm,
	hoverBackground: 'color-mix(in srgb, var(--color-primary) 80%, black)',

	solid: {
		primary: { background: '#0d6efd', color: '#fff', border: '#0d6efd' },
		secondary: { background: '#6c757d', color: '#fff', border: '#6c757d' },
		success: { background: '#198754', color: '#fff', border: '#198754' },
		warning: { background: '#ffc107', color: '#212529', border: '#ffc107' },
		danger: { background: '#dc3545', color: '#fff', border: '#dc3545' },
		info: { background: '#0dcaf0', color: '#fff', border: '#0dcaf0' },
		light: { background: '#f8f9fa', color: '#212529', border: '#f8f9fa' },
		dark: { background: '#212529', color: '#fff', border: '#212529' },
		link: { background: 'transparent', color: '#0d6efd', border: 'transparent' },
	},

	outline: {
		primary: { background: 'transparent', color: '#0d6efd', border: '#0d6efd' },
		secondary: { background: 'transparent', color: '#6c757d', border: '#6c757d' },
		success: { background: 'transparent', color: '#198754', border: '#198754' },
		warning: { background: 'transparent', color: '#ffc107', border: '#ffc107' },
		danger: { background: 'transparent', color: '#dc3545', border: '#dc3545' },
		info: { background: 'transparent', color: '#0dcaf0', border: '#0dcaf0' },
		light: { background: 'transparent', color: '#212529', border: '#212529' },
		dark: { background: 'transparent', color: '#212529', border: '#212529' },
	},

	size: {
		sm: {
			fontSize: '0.875rem',
			paddingX: '0.5rem',
			paddingY: '0.25rem',
		},
		md: {
			fontSize: '1rem',
			paddingX: '1rem',
			paddingY: '0.5rem',
		},
	},

	animation: {
		transition: 'background 0.15s ease, transform 0.1s ease',
		hoverAdjust: 20,
		activeAdjust: -30,
		focusScale: 1.02,
		activeScale: 0.98,
		disabledOpacity: 0.65,
	},

	borderColor: tokens.border.color.default,
	borderRadius: tokens.radius.md,
	borderWidth: tokens.border.width.md,
	fontSize: tokens.font.size.base,
	paddingX: tokens.space.lg,
	paddingY: tokens.space.md,
}
