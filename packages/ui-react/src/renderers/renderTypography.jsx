import React from 'react'
import PropTypes from 'prop-types'
import Typography from '../components/atoms/Typography.jsx'

/**
 * Renderer for Typography component
 *
 * @param {object} props - Component block definition
 * @returns {React.ReactNode} Rendered typography
 */
export default function renderTypography(props) {
	const { element, context, variant: propsVariant } = props
	const typographyVal =
		element.Typography ||
		element.typography ||
		(element && typeof element === 'object' ? Object.values(element)[0] : element)
	const isTagObj =
		typeof typographyVal === 'object' && typographyVal !== null && !Array.isArray(typographyVal)

	const children =
		(isTagObj
			? typographyVal.content || typographyVal.Typography || typographyVal.typography
			: typographyVal) ||
		element.content ||
		[]
	const variant = (isTagObj ? typographyVal.variant : null) || element.variant || propsVariant

	return (
		<Typography {...props} variant={variant}>
			{children}
		</Typography>
	)
}

renderTypography.propTypes = {
	element: PropTypes.object.isRequired,
}
