import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../context/UIContext.jsx'
import Typography from '../components/atoms/Typography.jsx'
import Input from '../components/atoms/Input.jsx'
import Button from '../components/atoms/Button.jsx'
import ReactElement from '../Element.jsx'

/**
 * Universal Renderer для interactive apps.
 * Обробляє requiresInput (форма) і compute (обчислення).
 * Agnostic apps повертають дані, рендерер будує JSX динамічно.
 *
 * @param {Object} input
 * @param {Object} input.element - Результат app.run() { requiresInput, compute, content }
 * @param {Object} input.context - UI контекст з actions
 * @returns {React.ReactNode} Форма + динамічний результат
 */
export default function renderInteractive({ element, context }) {
	// State holds user input, result and computing flag.
	const [inputData, setInputData] = useState({})
	const [result, setResult] = useState(/** @type {any} */ (null))
	const [isComputing, setIsComputing] = useState(false)

	const appElement = element || {}
	const { requiresInput = {}, compute, $content, content } = appElement
	const baseContent = Array.isArray($content || content) ? $content || content : []

	const handleInputChange = useCallback((fieldName, value) => {
		setInputData((prev) => ({ ...prev, [fieldName]: value }))
	}, [])

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault()
			setIsComputing(true)
			try {
				if (typeof compute === 'function') {
					const computed = await compute(inputData)
					setResult(computed)
				}
			} catch (err) {
				console.error('Compute error:', err)
				// @ts-ignore
				setResult({ error: err instanceof Error ? err.message : String(err) })
			} finally {
				setIsComputing(false)
			}
		},
		[inputData, compute],
	)

	const renderField = (field) => {
		const { name, type = 'text', label, defaultValue = '', min, ...fieldProps } = field
		const value = inputData[name] ?? defaultValue

		const { key, ...cleanFieldProps } = fieldProps

		const inputProps = {
			value,
			onChange: (e) => handleInputChange(name, e.target.value),
			...cleanFieldProps,
		}

		switch (type.toLowerCase()) {
			case 'number':
				return (
					<div key={`field-${name}`} style={{ marginBottom: '0.5rem' }}>
						<label htmlFor={name}>{label}</label>
						<Input id={name} type="number" {...inputProps} min={min} />
					</div>
				)
			default:
				return (
					<div key={`field-${name}`} style={{ marginBottom: '0.5rem' }}>
						<label htmlFor={name}>{label}</label>
						<Input id={name} type={type} {...inputProps} placeholder={label} />
					</div>
				)
		}
	}

	return (
		<div
			data-testid="interactive-renderer"
			style={{
				padding: '1rem',
				border: '1px solid #ccc',
				margin: '1rem 0',
				borderRadius: '0.25rem',
			}}
		>
			{/* Базовий контент з app */}
			{baseContent.map((block, i) => ReactElement.render(block, `base-${i}`, context))}

			{/* Форма input, якщо requiresInput */}
			{requiresInput.fields && (
				<form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
					<Typography variant="h4">Provide Input</Typography>
					{requiresInput.fields.map((field, i) => (
						<div key={`field-${i}`} style={{ marginBottom: '0.5rem' }}>
							{renderField(field)}
						</div>
					))}
					<Button type="submit" variant="primary" disabled={isComputing}>
						{isComputing ? 'Computing...' : 'Compute'}
					</Button>
				</form>
			)}

			{/* Результат обчислень */}
			{result && (
				<div
					style={{
						marginTop: '1rem',
						padding: '1rem',
						background: '#f0f8ff',
						borderRadius: '0.25rem',
					}}
				>
					{/* @ts-ignore */}
					<Typography variant="h5">{result.$title || 'Result'}</Typography>
					{/* @ts-ignore */}
					<Typography>{result.message || JSON.stringify(result)}</Typography>
					{/* @ts-ignore */}
					{result.updatedContent?.map((block, i) =>
						ReactElement.render(block, `result-${i}`, context),
					)}
					{/* @ts-ignore */}
					{result.error && (
						<Typography variant="body" style={{ color: 'red' }}>
							Error: {result.error}
						</Typography>
					)}
				</div>
			)}
		</div>
	)
}

renderInteractive.propTypes = {
	element: PropTypes.shape({
		requiresInput: PropTypes.object,
		compute: PropTypes.func,
		content: PropTypes.array,
	}),
	context: PropTypes.object.isRequired,
}
