import { createTheme } from '../createTheme.js'
import { tokens } from '../tokens.js'

/**
 * Night (dark) theme preset.
 * Optimized for low-light environments with deep background colors and vibrant text.
 * Overrides solid button styles while keeping contrast high.
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
				primary: { background: '#0d6efd', color: '#ffffff' },
				secondary: { background: '#6c757d', color: '#ffffff' },
				success: { background: '#198754', color: '#ffffff' },
				warning: { background: '#ffc107', color: '#000000' },
				danger: { background: '#dc3545', color: '#ffffff' },
				info: { background: '#0dcaf0', color: '#000000' },
				light: { background: '#aaaaaa', color: '#000000' },
				dark: { background: '#212529', color: '#ffffff' },
				link: { background: 'transparent', color: '#6ea8fe', border: 'transparent' },
			},
			outline: {
				primary: { background: 'transparent', color: '#0d6efd', border: '#0d6efd' },
				secondary: { background: 'transparent', color: '#6c757d', border: '#6c757d' },
				success: { background: 'transparent', color: '#198754', border: '#198754' },
				warning: { background: 'transparent', color: '#ffc107', border: '#ffc107' },
				danger: { background: 'transparent', color: '#dc3545', border: '#dc3545' },
				info: { background: 'transparent', color: '#0dcaf0', border: '#0dcaf0' },
				light: { background: 'transparent', color: '#aaaaaa', border: '#aaaaaa' },
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
		},
	},
})
