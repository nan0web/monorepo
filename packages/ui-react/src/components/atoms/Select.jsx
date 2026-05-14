import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

export default function Select({ options = [], ...props }) {
	const { theme } = useUI()
	const {
		borderRadius = '4px',
		borderWidth = '1px',
		borderColor = '#cccccc',
		fontSize = '14px',
		paddingX = '12px',
		paddingY = '8px',
		fontFamily = 'sans-serif',
	} = theme.atoms?.Select ?? {}

	const style = {
		border: `${borderWidth} solid ${borderColor}`,
		borderRadius,
		fontSize,
		paddingLeft: paddingX,
		paddingRight: paddingX,
		paddingTop: paddingY,
		paddingBottom: paddingY,
		fontFamily,
		...props.style,
	}

	const selectOptions = options.map((option, i) => {
		if (typeof option === 'string') {
			return React.createElement('option', { key: i, value: option }, option)
		}
		return React.createElement('option', { key: i, value: option.value }, option.label)
	})

	return React.createElement('select', { style, ...props }, selectOptions)
}

Select.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				value: PropTypes.string.isRequired,
				label: PropTypes.string.isRequired,
			}),
		]),
	),
	style: PropTypes.object,
}
