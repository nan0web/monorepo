import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'
import Input from './Input.jsx'

/**
 * Autocomplete component - searchable selection list.
 *
 * @param {Object} props
 * @param {Array|Function} props.options - List of options or fetcher
 * @param {Function} [props.onSelect] - Selection handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Current value
 */
export default function Autocomplete({
	options = [],
	onSelect,
	placeholder,
	value: initialValue = '',
}) {
	const { theme } = useUI()
	const [query, setQuery] = useState(initialValue)
	/** @type {[Array<{label: string, value: any}>, Function]} */
	const [filteredChoices, setFilteredChoices] = useState(
		/** @type {Array<{label: string, value: any}>} */ ([]),
	)
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const wrapperRef = useRef(/** @type {HTMLDivElement|null} */ (null))

	useEffect(() => {
		const handleClickOutside = (event) => {
			const el = wrapperRef.current
			if (el && !el.contains(/** @type {Node} */ (event.target))) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		const fetchOptions = async () => {
			setLoading(true)
			let currentOptions = typeof options === 'function' ? await options(query) : options

			if (currentOptions instanceof Map) {
				currentOptions = Array.from(currentOptions.entries()).map(([value, label]) => ({
					label,
					value,
				}))
			}

			const choices = currentOptions
				.map((opt) => {
					const label = typeof opt === 'string' ? opt : opt.title || opt.label || ''
					const value = typeof opt === 'string' ? opt : opt.value
					return { label, value }
				})
				.filter((choice) => choice.label.toLowerCase().includes(query.toLowerCase()))

			setFilteredChoices(choices)
			setLoading(false)
		}

		const timer = setTimeout(fetchOptions, 200)
		return () => clearTimeout(timer)
	}, [query, options])

	const handleSelect = (choice) => {
		setQuery(choice.label)
		setIsOpen(false)
		if (onSelect) onSelect(choice)
	}

	return (
		<div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
			<Input
				value={query}
				defaultValue={query}
				onChange={(e) => {
					setQuery(e.target.value)
					setIsOpen(true)
				}}
				onFocus={() => setIsOpen(true)}
				placeholder={placeholder}
			/>

			{isOpen && (filteredChoices.length > 0 || loading) && (
				<div
					style={{
						position: 'absolute',
						top: '100%',
						left: 0,
						right: 0,
						backgroundColor: 'var(--color-background, #ffffff)',
						border: '1px solid var(--color-border, #dee2e6)',
						borderRadius: '0.375rem',
						boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
						zIndex: 1000,
						maxHeight: '200px',
						overflowY: 'auto',
						marginTop: '4px',
					}}
				>
					{loading ? (
						<div style={{ padding: '8px 12px', opacity: 0.6 }}>Loading...</div>
					) : (
						filteredChoices.map((choice, i) => (
							<div
								key={i}
								onClick={() => handleSelect(choice)}
								style={{
									padding: '8px 12px',
									cursor: 'pointer',
									backgroundColor: 'transparent',
									transition: 'background 0.2s',
								}}
								onMouseEnter={(e) => {
									const el = /** @type {HTMLElement} */ (e.target)
									el.style.backgroundColor = 'rgba(0,0,0,0.05)'
								}}
								onMouseLeave={(e) => {
									const el = /** @type {HTMLElement} */ (e.target)
									el.style.backgroundColor = 'transparent'
								}}
							>
								{choice.label}
							</div>
						))
					)}
				</div>
			)}
		</div>
	)
}

Autocomplete.propTypes = {
	options: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(Map), PropTypes.func]),
	onSelect: PropTypes.func,
	placeholder: PropTypes.string,
	value: PropTypes.string,
}
