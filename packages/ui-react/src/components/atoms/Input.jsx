import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

export default function Input({ type = 'text', value, defaultValue, ...props }) {
	const { theme } = useUI()
	const themeDefaults = theme?.atoms?.Input || {}
	const defaults = {
		borderRadius: '0.375rem',
		borderWidth: '2px',
		borderColor: 'var(--color-border, #d1d5db)',
		fontSize: '1rem',
		paddingX: '1rem',
		paddingY: '0.75rem',
		fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		backgroundColor: 'var(--color-background, #ffffff)',
		color: 'var(--color-text, #212529)',
		...themeDefaults,
	}

	const style = {
		borderRadius: defaults.borderRadius,
		border: `${defaults.borderWidth} solid ${defaults.borderColor}`,
		fontSize: defaults.fontSize,
		paddingLeft: defaults.paddingX,
		paddingRight: defaults.paddingX,
		paddingTop: defaults.paddingY,
		paddingBottom: defaults.paddingY,
		fontFamily: defaults.fontFamily,
		backgroundColor: defaults.backgroundColor,
		color: defaults.color,
		outline: 'none',
		transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
		width: '100%',
		...props.style,
	}

	// Only set role for non-password inputs
	const inputProps = {
		type: type.toLowerCase(),
		value,
		defaultValue,
		style,
		role: 'textbox',
		...props,
	}
	if (type.toLowerCase() === 'password') {
		inputProps.role = 'password'
	}

	return React.createElement('input', inputProps)
}

Input.propTypes = {
	type: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	style: PropTypes.object,
}
