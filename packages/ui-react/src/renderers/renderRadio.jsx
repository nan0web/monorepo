import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Radio from '../components/atoms/Radio.jsx'

/**
 * Renderer for Radio component with local state support for playground.
 * Note: Radio groups in playground are tricky without a parent Form renderer context,
 * but for basic "toggle per item" visual feedback or if they share name/context, this helps.
 *
 * @param {object} props
 * @param {object} props.element - Element definition
 * @param {any} [props.context] - UI Context
 * @param {any} [props.onChange] - Change handler
 * @param {any} [props.name] - Name
 * @param {any} [props.disabled] - Disabled state
 * @returns {React.ReactNode} Rendered radio
 */
export default function renderRadio(props) {
    const { element, context, ...otherProps } = /** @type {any} */ (props)

    // Support both { radio: { $checked: true } } and { Radio: true, $checked: true }
    const tagVal = element.radio ?? element.Radio ?? {}
    const isTagObj = typeof tagVal === 'object' && tagVal !== null

    const checked = element.$checked ?? (isTagObj ? tagVal.$checked : undefined)
    const initialChecked = checked ?? element.value ?? (tagVal === true)

    const name = element.$name ?? (isTagObj ? tagVal.$name : undefined) ?? otherProps.name
    const title = element.$title ?? (isTagObj ? tagVal.$title : undefined) ?? otherProps.title

    const handleChange = (e) => {
        const isChecked = e.target.checked
        if (context?.onAction) {
            context.onAction('Radio Change', {
                name,
                status: isChecked ? 'checked' : 'unchecked',
                checked: isChecked,
                value: e.target.value,
                title
            })
        }
        if (otherProps.onChange) {
            otherProps.onChange(e)
        }
    }

    const mergedProps = {
        ...otherProps,
        defaultChecked: initialChecked,
        onChange: handleChange,
        name,
        title,
        disabled: element.$disabled ?? (isTagObj ? tagVal.$disabled : false) ?? otherProps.disabled,
    }

    const label = title || element.$label || (isTagObj ? tagVal.$label : '') || ''

    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
            <Radio {...mergedProps} />
            {label && <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>}
        </label>
    )
}

renderRadio.propTypes = {
    element: PropTypes.object,
    onChange: PropTypes.func,
    name: PropTypes.string,
    disabled: PropTypes.bool,
}
