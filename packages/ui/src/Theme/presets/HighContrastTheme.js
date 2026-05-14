import { createTheme } from '../createTheme.js'
import { tokens } from '../tokens.js'

/**
 * High contrast theme preset.
 * Designed for maximum readability by increasing contrast between text and background.
 */
export default createTheme({
	atoms: {
		Button: {
			color: tokens.color.text,
			background: tokens.color.primary,
			shadow: tokens.shadow.sm,
			hoverBackground: 'color-mix(in srgb, var(--color-primary) 80%, black)',
			borderColor: tokens.border.color.default,
			borderRadius: tokens.radius.sm,
			borderWidth: tokens.border.width.sm,
			fontSize: tokens.font.size.base,
			paddingX: tokens.space.lg,
			paddingY: tokens.space.md,
			solid: {
				primary: { background: '#000000', color: '#ffffff' },
				secondary: { background: '#333333', color: '#ffffff' },
				success: { background: '#006600', color: '#ffffff' },
				warning: { background: '#996600', color: '#000000' },
				danger: { background: '#990000', color: '#ffffff' },
				info: { background: '#006699', color: '#ffffff' },
				light: { background: '#dddddd', color: '#000000' },
				dark: { background: '#222222', color: '#ffffff' },
				link: { background: 'transparent', color: '#000099', border: 'transparent' },
			},
			outline: {
				primary: { background: '#ffffff', color: '#000000', border: '#000000' },
				secondary: { background: '#ffffff', color: '#333333', border: '#333333' },
				success: { background: '#ffffff', color: '#006600', border: '#006600' },
				warning: { background: '#ffffff', color: '#996600', border: '#996600' },
				danger: { background: '#ffffff', color: '#990000', border: '#990000' },
				info: { background: '#ffffff', color: '#006699', border: '#006699' },
				light: { background: '#ffffff', color: '#000000', border: '#000000' },
				dark: { background: '#ffffff', color: '#222222', border: '#222222' },
			},
			size: {
				sm: {
					fontSize: '0.875rem',
					paddingX: '0.5rem',
					paddingY: '0.25rem',
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
		},
	},
})
