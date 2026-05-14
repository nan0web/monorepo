import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

/**
 * Badge component with Bootstrap‑like variant colors and appropriate text color.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.variant='primary'] - One of: primary, secondary, success, warning, danger, info, light, dark
 * @param {Object} [props.style] - Additional inline styles
 */
export default function Badge({ children, variant = 'primary', ...props }) {
	const { theme } = useUI()
	const {
		borderRadius = '0.25rem',
		fontSize = '0.75rem',
		paddingX = '0.5rem',
		paddingY = '0.25rem',
		fontWeight = '500',
	} = theme.atoms?.Badge ?? {}

	const variantStyles = {
		primary: { backgroundColor: '#0d6efd', color: '#ffffff' },
		secondary: { backgroundColor: '#6c757d', color: '#ffffff' },
		success: { backgroundColor: '#198754', color: '#ffffff' },
		warning: { backgroundColor: '#ffc107', color: '#000000' },
		danger: { backgroundColor: '#dc3545', color: '#ffffff' },
		info: { backgroundColor: '#0dcaf0', color: '#000000' },
		light: { backgroundColor: '#f8f9fa', color: '#212529' },
		dark: { backgroundColor: '#212529', color: '#ffffff' },
	}

	const style = {
		borderRadius,
		fontSize,
		paddingLeft: paddingX,
		paddingRight: paddingX,
		paddingTop: paddingY,
		paddingBottom: paddingY,
		fontWeight,
		display: 'inline-block',
		verticalAlign: 'baseline',
		...variantStyles[variant],
		...props.style,
	}

	return React.createElement('span', { style, ...props }, children)
}

Badge.propTypes = {
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
	]),
	style: PropTypes.object,
}
