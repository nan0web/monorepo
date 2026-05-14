import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

/**
 * Button component.
 * Uses theme definition from ui-core if available (theme.atoms.Button),
 * otherwise falls back to local defaults.
 * Maps 'variants' to 'solid' and 'outlines' to 'outline' based on ui-core schema.
 */
export default function Button({
	children,
	variant = 'primary',
	outline = false,
	size = 'md',
	...props
}) {
	const { theme, reducedMotion } = useUI()

	// Use theme defaults or fallbacks.
	// The theme object structure matches @nan0web/ui/src/theme/atoms/Button.js
	// We cast to any to avoid TypeScript errors with schema mismatches in current tooling
	const config = /** @type {any} */ (theme?.atoms?.Button || {
		solid: {
			primary: { backgroundColor: 'var(--color-primary, #0d6efd)', color: '#ffffff', border: 'var(--color-primary, #0d6efd)' },
			secondary: { backgroundColor: 'var(--color-secondary, #6c757d)', color: '#ffffff', border: 'var(--color-secondary, #6c757d)' },
			success: { backgroundColor: 'var(--color-success, #198754)', color: '#ffffff', border: 'var(--color-success, #198754)' },
			warning: { backgroundColor: 'var(--color-warning, #ffc107)', color: '#000000', border: 'var(--color-warning, #ffc107)' },
			danger: { backgroundColor: 'var(--color-error, #dc3545)', color: '#ffffff', border: 'var(--color-error, #dc3545)' },
			info: { backgroundColor: '#0dcaf0', color: '#000000', border: '#0dcaf0' },
			light: { backgroundColor: '#f8f9fa', color: '#212529', border: '#f8f9fa' },
			dark: { backgroundColor: '#212529', color: '#ffffff', border: '#212529' },
			link: { backgroundColor: 'transparent', color: 'var(--color-primary, #0d6efd)', border: 'transparent' },
		},
		outline: {
			primary: { backgroundColor: 'transparent', color: 'var(--color-primary, #0d6efd)', border: 'var(--color-primary, #0d6efd)' },
			secondary: { backgroundColor: 'transparent', color: 'var(--color-secondary, #6c757d)', border: 'var(--color-secondary, #6c757d)' },
			success: { backgroundColor: 'transparent', color: 'var(--color-success, #198754)', border: 'var(--color-success, #198754)' },
			warning: { backgroundColor: 'transparent', color: 'var(--color-warning, #ffc107)', border: 'var(--color-warning, #ffc107)' },
			danger: { backgroundColor: 'transparent', color: 'var(--color-error, #dc3545)', border: 'var(--color-error, #dc3545)' },
			info: { backgroundColor: 'transparent', color: '#0dcaf0', border: '#0dcaf0' },
			light: { backgroundColor: 'transparent', color: '#aaaaaa', border: '#aaaaaa' },
			dark: { backgroundColor: 'transparent', color: '#212529', border: '#212529' },
		},
		size: {
			sm: { fontSize: '0.875rem', paddingX: '0.5rem', paddingY: '0.25rem' },
			md: { fontSize: '1rem', paddingX: '1rem', paddingY: '0.5rem' },
		},
		animation: {
			transition: 'background 0.15s ease, transform 0.1s ease',
			hoverAdjust: 20,
			activeAdjust: -30,
			focusScale: 1.02,
			activeScale: 0.98,
			disabledOpacity: 0.65,
		},
		borderRadius: '0.375rem',
		fontWeight: '500',
	})

	const isOutline = Boolean(outline)
	const isLink = variant === 'link'

	// Map variant to solid/outline config
	const solidStyles = config.solid || {}
	const outlineStyles = config.outline || {}

	// Determine variants. Note: ui-core puts 'link' inside solid usually.
	let variantStyle = {}
	if (isLink) {
		variantStyle = solidStyles.link || { backgroundColor: 'transparent', color: 'blue' }
	} else if (isOutline) {
		variantStyle = outlineStyles[variant] || outlineStyles.primary
	} else {
		variantStyle = solidStyles[variant] || solidStyles.primary
	}

	// Size styles
	const sizeConfig = (config.size && config.size[size]) || config.size?.md || { paddingX: '1rem', paddingY: '0.5rem', fontSize: '1rem' }
	const sizeStyle = {
		fontSize: sizeConfig.fontSize,
		// Adapt padding: ui-core uses paddingX/Y, locally might need standard padding
		padding: sizeConfig.padding || `${sizeConfig.paddingY} ${sizeConfig.paddingX}`,
	}

	const [isHovered, setIsHovered] = useState(false)
	const [isActive, setIsActive] = useState(false)
	const [isFocused, setIsFocused] = useState(false)

	// Additional styles
	const style = {
		borderRadius: config.borderRadius,
		fontWeight: config.fontWeight || '500',
		cursor: props.disabled ? 'not-allowed' : 'pointer',
		...sizeStyle, // applies padding/fontSize
		backgroundColor: variantStyle.backgroundColor || variantStyle.background || 'transparent',
		color: variantStyle.color,
		border: `1px solid ${variantStyle.border || variantStyle.borderColor || 'transparent'}`,
		textDecoration: isLink ? 'underline' : 'none',
		opacity: props.disabled ? (config.animation?.disabledOpacity ?? 0.65) : 1,
		transform: isActive
			? `scale(${config.animation?.activeScale ?? 0.98})`
			: isFocused
				? `scale(${config.animation?.focusScale ?? 1.02})`
				: 'scale(1)',
		transition: reducedMotion ? 'none' : (config.animation?.transition ?? 'all 0.15s'),
		...(props.style || {}),
	}

	// Hover logic: ui-core theme supports hoverBackground (computed) or just relies on CSS vars?
	// NightTheme defines hoverBackground.
	if (isHovered && !props.disabled && !isOutline && !isLink) {
		// If explicit hoverBackground exists in theme root (atoms.Button), use it
		// Otherwise we rely on CSS :hover if we were writing CSS, but in React inline styles we need JS.
		if (config.hoverBackground) {
			style.backgroundColor = config.hoverBackground
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !props.disabled) setIsActive(true)
		props.onKeyDown?.(e)
	}

	const handleKeyUp = (e) => {
		if (e.key === 'Enter') {
			setIsActive(false)
			setIsFocused(false)
		}
		props.onKeyUp?.(e)
	}

	return (
		<button
			{...props}
			style={style}
			disabled={props.disabled}
			onMouseEnter={() => !props.disabled && setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false)
				setIsActive(false)
			}}
			onMouseDown={() => !props.disabled && setIsActive(true)}
			onMouseUp={() => setIsActive(false)}
			onFocus={() => !props.disabled && setIsFocused(true)}
			onBlur={() => setIsFocused(false)}
			onKeyDown={handleKeyDown}
			onKeyUp={handleKeyUp}
		>
			{children}
		</button>
	)
}

Button.propTypes = {
	children: PropTypes.node.isRequired,
	variant: PropTypes.oneOf([
		'primary',
		'secondary',
		'success',
		'warning',
		'danger',
		'info',
		'light',
		'dark',
		'link',
	]),
	outline: PropTypes.bool,
	size: PropTypes.oneOf(['md', 'sm']),
	style: PropTypes.object,
	disabled: PropTypes.bool,
	onKeyDown: PropTypes.func,
	onKeyUp: PropTypes.func,
}

Button.defaultProps = {
	style: {},
}
