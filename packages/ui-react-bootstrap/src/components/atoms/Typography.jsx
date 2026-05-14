import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '@nan0web/ui-react'

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

export default function Typography({ variant = 'body', children, style, ...props }) {
	const { theme } = useUI()
	const bootstrapVars = theme.name === 'bootstrap'

	const defaultBody = bootstrapVars
		? {
				fontSize: 'var(--bs-body-font-size)',
				fontWeight: 'var(--bs-body-font-weight)',
				color: 'var(--bs-body-color)',
				lineHeight: 'var(--bs-body-line-height)',
			}
		: {
				fontSize: '1rem',
				fontWeight: 'normal',
			}

	const { variants = {} } = theme.atoms?.Typography ?? {}

	const variantStyles = variants[variant] ?? variants.body ?? defaultBody
	const fontSize = variantStyles.fontSize ?? defaultBody.fontSize
	const fontWeight = variantStyles.fontWeight ?? defaultBody.fontWeight
	const color = bootstrapVars ? 'var(--bs-body-color)' : undefined

	const Component = variantMap[variant] || 'p'
	const mergedStyle = {
		fontSize,
		fontWeight,
		color,
		...(bootstrapVars
			? {
					lineHeight: 'var(--bs-body-line-height)',
					fontFamily: 'var(--bs-font-sans-serif)',
				}
			: {}),
		...style,
	}

	return (
		<Component style={mergedStyle} {...props}>
			{children}
		</Component>
	)
}

Typography.propTypes = {
	variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'caption']),
	children: PropTypes.node.isRequired,
	style: PropTypes.object,
}
