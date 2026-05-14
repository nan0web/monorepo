import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

const variantMap = {
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	body: 'p',
	small: 'small',
	caption: 'span',
}

/**
 * @param {Object} props
 * @param {'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'body'|'small'|'caption'} [props.variant='body']
 * @param {React.ReactNode} props.children
 * @param {React.CSSProperties} [props.style]
 */
export default function Typography({ variant = 'body', children, ...props }) {
	const { theme } = useUI()
	const typographyConfig = theme?.atoms?.Typography || {}
	// @ts-ignore – TS cannot infer that `variants` may exist on the config object.
	const variants = typographyConfig.variants ?? {}

	const defaultStyles = {
		margin: '0 0 1rem 0',
		fontWeight: '400',
		lineHeight: '1.5',
	}

	const variantStyles = variants[variant] ?? variants.body ?? {}
	const allStyles = {
		...defaultStyles,
		...variantStyles,
		// @ts-ignore
		...props.style, // `props.style` may be undefined; spreading works at runtime.
	}

	const Component = variantMap[variant] || 'p'

	return React.createElement(Component, { style: allStyles, ...props }, children)
}

Typography.propTypes = {
	variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'caption']),
	children: PropTypes.node.isRequired,
	style: PropTypes.object,
}
