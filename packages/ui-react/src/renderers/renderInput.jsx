import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Input from '../components/atoms/Input.jsx'

/**
 * Renderer for Input component with local state support for playground.
 *
 * @param {object} props
 * @param {object} props.element - Raw element
 * @param {any} [props.context] - UI Context
 * @returns {React.ReactNode} Rendered input
 */
export default function renderInput(props) {
	const { element, context, ...otherProps } = /** @type {any} */ (props)
	const initialValue = element.$value ?? element.value ?? ''
	const [value, setValue] = useState(initialValue)

	const handleChange = (e) => {
		const val = e.target.value
		if (context?.onAction) {
			context.onAction('Input Change', { value: val, type: element.$type || 'text' })
		}
		setValue(val)
		if (otherProps.onChange) {
			otherProps.onChange(e)
		}
	}

	return (
		<Input
			{...otherProps}
			value={value}
			onChange={handleChange}
			type={element.$type || otherProps.type}
			placeholder={element.$placeholder || otherProps.placeholder}
			disabled={element.$disabled || otherProps.disabled}
		/>
	)
}

renderInput.propTypes = {
	element: PropTypes.object,
	context: PropTypes.object,
}
