import React from 'react'
import PropTypes from 'prop-types'
import { Button as BootstrapButton } from 'react-bootstrap'
import { useUI } from '@nan0web/ui-react'
import ButtonSpec from '../../specs/core/ButtonSpec.js'

import Icon from './Icon/Icon'
import { Spinner } from 'react-bootstrap'

/**
 * Bootstrap Button wrapper for declarative UI.
 */
export default function Button({
	variant = 'primary',
	size = 'md',
	outline = false,
	disabled = false,
	isLoading = false,
	icon,
	iconRight = false,
	children,
	style,
	...props
}) {
	const { theme } = useUI()
	const spec = ButtonSpec.from({ variant, size, outline, disabled })
	const bsVariant = spec.outline ? `outline-${spec.variant}` : spec.variant
	const bsSize = spec.size

	const content = (
		<span className="d-flex align-items-center justify-content-center gap-2">
			{isLoading && <Spinner animation="border" size="sm" role="status" aria-hidden="true" />}
			{!isLoading && icon && !iconRight && <Icon name={icon} size={18} />}
			{children}
			{!isLoading && icon && iconRight && <Icon name={icon} size={18} />}
		</span>
	)

	return (
		<BootstrapButton
			variant={bsVariant}
			size={bsSize}
			disabled={spec.disabled || isLoading}
			{...props}
			style={style}
		>
			{content}
		</BootstrapButton>
	)
}

Button.propTypes = {
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
	size: PropTypes.oneOf(['sm', 'md', 'lg']),
	outline: PropTypes.bool,
	disabled: PropTypes.bool,
	children: PropTypes.node,
	style: PropTypes.object,
}
