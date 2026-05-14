import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from '../components/atoms/Select.jsx'

/**
 * Renderer for Select component with local state support.
 *
 * @param {object} props
 * @param {object} props.element - Element definition
 * @param {any} [props.context] - UI Context
 * @param {any} [props.onChange] - Change handler
 * @param {any} [props.disabled] - Disabled state
 * @returns {React.ReactNode} Rendered select
 */
export default function renderSelect(props) {
    const { element, context, ...otherProps } = /** @type {any} */ (props)

    // Support both { select: { ... } } and { Select: true, ... }
    const tagVal = element.select ?? element.Select ?? {}
    const isTagObj = typeof tagVal === 'object' && tagVal !== null

    const initialOptions = element.$options ?? (isTagObj ? tagVal.$options : undefined) ?? element.options ?? (isTagObj ? tagVal.options : undefined) ?? []

    // Determine if we should simulate loading
    const isAsync = element.$loading === true || (isTagObj && tagVal.$loading === true)

    const initialValue = element.$value ?? (isTagObj ? tagVal.$value : undefined) ?? element.value ?? (isTagObj ? tagVal.value : undefined) ?? ''

    const [value, setValue] = useState(initialValue)
    const [options, setOptions] = useState(isAsync ? [] : initialOptions)
    const [loading, setLoading] = useState(isAsync)

    // Simulate dynamic loading
    useEffect(() => {
        if (isAsync) {
            const timer = setTimeout(() => {
                setOptions(initialOptions)
                setLoading(false)
                if (context?.onAction) {
                    context.onAction('Select Data Loaded', { count: initialOptions.length })
                }
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [isAsync, initialOptions])

    const title = element.$title ?? (isTagObj ? tagVal.$title : undefined) ?? otherProps.title

    const handleChange = (e) => {
        const newValue = e.target.value
        if (context?.onAction) {
            context.onAction('Select Change', { value: newValue, title })
        }
        setValue(newValue)
        if (otherProps.onChange) {
            otherProps.onChange(e)
        }
    }

    const mergedProps = {
        ...otherProps,
        value,
        onChange: handleChange,
        title,
        disabled: element.$disabled ?? (isTagObj ? tagVal.$disabled : false) ?? otherProps.disabled,
        options: loading ? [{ value: '', label: 'Loading data...' }] : options,
    }

    return <Select {...mergedProps} />
}

renderSelect.propTypes = {
    element: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
}
