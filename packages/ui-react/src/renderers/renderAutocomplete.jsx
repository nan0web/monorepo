import React from 'react'
import Autocomplete from '../components/atoms/Autocomplete.jsx'

/**
 * Renderer for Autocomplete component.
 *
 * @param {Record<string, any>} input
 * @returns {React.ReactNode} Rendered autocomplete
 */
export default function renderAutocomplete(input) {
	const { element, context, ...props } = input
	const autocompleteVal = element.autocomplete || element.Autocomplete || {}
	const isTagObj =
		typeof autocompleteVal === 'object' &&
		autocompleteVal !== null &&
		!Array.isArray(autocompleteVal)

	// @ts-ignore - data-driven element properties are dynamic
	const options =
		(isTagObj ? autocompleteVal.options : null) ||
		element.options ||
		(Array.isArray(autocompleteVal) ? autocompleteVal : null) ||
		props.options ||
		[]
	// @ts-ignore
	const placeholder =
		(isTagObj ? autocompleteVal.placeholder : null) || element.placeholder || props.placeholder
	// @ts-ignore
	const value = (isTagObj ? autocompleteVal.value : null) || element.value || props.value
	// @ts-ignore
	const onSelect =
		(isTagObj ? autocompleteVal.onSelect : null) || element.onSelect || props.onSelect

	const handleSelect = (choice) => {
		if (context?.onAction) {
			context.onAction('Autocomplete Selection', {
				label: choice.label,
				value: choice.value,
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
