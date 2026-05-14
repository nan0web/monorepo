import React, { useState } from 'react'
import PropTypes from 'prop-types'
import TextArea from '../components/atoms/TextArea.jsx'

/**
 * Renderer for TextArea component with local state support.
 *
 * @param {object} props
 * @param {object} props.element - Element definition
 * @param {any} [props.context] - UI Context
 * @param {any} [props.onChange] - Change handler
 * @param {any} [props.disabled] - Disabled state
 * @returns {React.ReactNode} Rendered textarea
 */
export default function renderTextArea(props) {
    const { element, context, ...otherProps } = /** @type {any} */ (props)
    const initialValue = element.$value ?? element.value ?? ''
    const [value, setValue] = useState(initialValue)

    const handleChange = (e) => {
        const val = e.target.value
        if (context?.onAction) {
            context.onAction('TextArea Change', {
                length: val.length,
                value: val.substring(0, 20) + (val.length > 20 ? '...' : '')
            })
        }
        setValue(val)
        if (otherProps.onChange) {
            otherProps.onChange(e)
        }
    }

    const mergedProps = {
        ...otherProps,
        value,
        onChange: handleChange,
        disabled: element.$disabled ?? otherProps.disabled,
        rows: element.$rows ?? element.rows,
        cols: element.$cols ?? element.cols,
        placeholder: element.$placeholder ?? element.placeholder,
    }

    return <TextArea {...mergedProps} />
}

renderTextArea.propTypes = {
    element: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
}
