// src/tokens.js
export const tokens = {
	// Spacing
	space: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '0.75rem',
		lg: '1rem',
		xl: '1.5rem',
	},

	// Radius
	radius: {
		none: '0',
		sm: '0.125rem',
		md: '0.25rem',
		lg: '0.5rem',
		full: '9999px',
	},

	// Border
	border: {
		width: {
			sm: '1px',
			md: '2px',
		},
		color: {
			default: 'var(--color-border)',
			muted: 'var(--color-border-muted)',
			error: 'var(--color-error)',
		},
	},

	// Color
	color: {
		text: 'var(--color-text)',
		background: 'var(--color-background)',
		primary: 'var(--color-primary)',
		success: 'var(--color-success)',
		warning: 'var(--color-warning)',
		error: 'var(--color-error)',
	},

	// Typography
	font: {
		family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		size: {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
		},
		weight: {
			normal: '400',
			medium: '500',
			bold: '700',
		},
	},

	// Shadows
	shadow: {
		sm: '0 1px 2px rgba(0,0,0,0.05)',
		md: '0 4px 6px rgba(0,0,0,0.1)',
		lg: '0 10px 25px rgba(0,0,0,0.15)',
	},

	// Breakpoints (Bootstrap 5)
	breakpoint: {
		xs: '0', // extra‑small
		sm: '576px',
		md: '768px',
		lg: '992px',
		xl: '1200px',
		xxl: '1400px',
	},

	// Container max‑widths (Bootstrap 5)
	container: {
		sm: '540px',
		md: '720px',
		lg: '960px',
		xl: '1140px',
		xxl: '1320px',
	},

	// Z‑index scale (Bootstrap)
	zIndex: {
		dropdown: 1000,
		sticky: 1020,
		fixed: 1030,
		modalBackdrop: 1040,
		modal: 1050,
		popover: 1060,
		tooltip: 1070,
	},

	// Opacity scale
	opacity: {
		0: '0',
		10: '0.1',
		25: '0.25',
		50: '0.5',
		75: '0.75',
		90: '0.9',
		100: '1',
	},

	// Transition durations
	transition: {
		fast: '150ms',
		medium: '300ms',
		slow: '500ms',
	},
}
