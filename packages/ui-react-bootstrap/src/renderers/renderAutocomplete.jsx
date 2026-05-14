import React from 'react'
import Autocomplete from '../components/atoms/Autocomplete.jsx'

/**
 * Bootstrap-themed Autocomplete renderer.
 */
export default function renderAutocomplete({ element, context, ...props }) {
    const autocompleteVal = element.autocomplete || element.Autocomplete || {}
    const isTagObj = typeof autocompleteVal === 'object' && autocompleteVal !== null && !Array.isArray(autocompleteVal)

    const options = (isTagObj ? autocompleteVal.options : null) || element.options || (Array.isArray(autocompleteVal) ? autocompleteVal : null) || props.options || []
    const placeholder = (isTagObj ? autocompleteVal.placeholder : null) || element.placeholder || props.placeholder
    const value = (isTagObj ? autocompleteVal.value : null) || element.value || props.value
    const onSelect = (isTagObj ? autocompleteVal.onSelect : null) || element.onSelect || props.onSelect

    const handleSelect = (choice) => {
        if (context?.onAction) {
            context.onAction('Autocomplete Selection', {
                label: choice.label,
                value: choice.value
            })
        }
        if (onSelect) onSelect(choice)
    }

    return (
        <Autocomplete
            options={options}
            placeholder={placeholder}
            value={value}
            onSelect={handleSelect}
        />
    )
}
