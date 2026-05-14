import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../components/atoms/Checkbox.jsx'

/**
 * Renderer for Checkbox component with local state support for playground.
 *
 * @param {object} props
 * @param {object} props.element - Element definition
 * @param {any} [props.context] - UI Context
 * @param {any} [props.onChange] - Change handler
 * @param {any} [props.disabled] - Disabled state
 * @returns {React.ReactNode} Rendered checkbox
 */
export default function renderCheckbox(props) {
    const { element, context, ...otherProps } = /** @type {any} */ (props)

    // Support both { checkbox: { $checked: true } } and { Checkbox: true, $checked: true }
    const tagVal = element.checkbox ?? element.Checkbox ?? {}
    const isTagObj = typeof tagVal === 'object' && tagVal !== null

    const checked = element.$checked ?? (isTagObj ? tagVal.$checked : undefined)
    const initialChecked = checked ?? element.value ?? (tagVal === true)

    const [internalChecked, setChecked] = useState(initialChecked)
    const title = element.$title ?? (isTagObj ? tagVal.$title : undefined) ?? otherProps.title

    const handleChange = (e) => {
        const isChecked = e.target.checked
        if (context?.onAction) {
            context.onAction('Checkbox Change', {
                status: isChecked ? 'checked' : 'unchecked',
                checked: isChecked,
                title
            })
        }
        setChecked(isChecked)
        if (otherProps.onChange) {
            otherProps.onChange(e)
        }
    }

    const mergedProps = {
        ...otherProps,
        checked: internalChecked,
        onChange: handleChange,
        title,
        disabled: element.$disabled ?? (isTagObj ? tagVal.$disabled : false) ?? otherProps.disabled,
    }

    const label = title || element.$label || (isTagObj ? tagVal.$label : '') || ''

    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
            <Checkbox {...mergedProps} />
            {label && <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>}
        </label>
    )
}

renderCheckbox.propTypes = {
    element: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
}
