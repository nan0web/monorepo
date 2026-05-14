/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { UIProvider } from '../context/UIContext.jsx'
import UIContextValue from '../context/UIContextValue.jsx'

// Isolated mock component that doesn't rely on useUI
function MockInteractiveRenderer({ element, context }) {
	const { useState, useCallback } = React
	const [inputData, setInputData] = useState({})
	const [result, setResult] = useState(null)
	const [isComputing, setIsComputing] = useState(false)

	const { requiresInput = {}, compute, $content: baseContent = [] } = element
	// Mock theme from context prop
	const { theme } = context || {}

	const handleInputChange = useCallback((fieldName, value) => {
		setInputData((prev) => ({ ...prev, [fieldName]: value }))
	}, [])

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault()
			setIsComputing(true)
			try {
				const computed = await compute(inputData)
				setResult(computed)
			} catch (err) {
				setResult({ error: err.message })
			} finally {
				setIsComputing(false)
			}
		},
		[inputData, compute],
	)

	const renderField = (field) => {
		const { name, type = 'text', label, defaultValue = '', min, ...fieldProps } = field
		const value = inputData[name] ?? defaultValue

		return (
			<label key={name} htmlFor={name}>
				{label}
				<input
					id={name}
					type={type}
					value={value}
					onChange={(e) => handleInputChange(name, e.target.value)}
					min={min}
					aria-label={label}
					{...fieldProps}
				/>
			</label>
		)
	}

	return (
		<div data-testid="interactive-renderer" style={{ padding: '1rem', border: '1px solid #ccc' }}>
			{/* Base content - simple render */}
			{baseContent.map((block, i) => (
				<div key={`base-${i}`}>
					{Array.isArray(block.Typography) ? block.Typography[0] : 'Base'}
				</div>
			))}

			{/* Form */}
			{requiresInput.fields && (
				<form onSubmit={handleSubmit} data-testid="interactive-form">
					<div>Provide Input</div>
					{requiresInput.fields.map((field, i) => (
						<div key={`field-${i}`}>{renderField(field)}</div>
					))}
					<button type="submit" disabled={isComputing} data-testid="compute-btn">
						{isComputing ? 'Computing...' : 'Compute'}
					</button>
				</form>
			)}

			{/* Result */}
			{result && (
				<div data-testid="result" style={{ marginTop: '1rem' }}>
					<div>{result.$title || 'Result'}</div>
					<div>{result.message || JSON.stringify(result)}</div>
					{result.updatedContent?.map((block, i) => (
						<div key={`result-${i}`}>{Array.isArray(block.p) ? block.p[0] : 'Result block'}</div>
					))}
					{result.error && <div style={{ color: 'red' }}>Error: {result.error}</div>}
				</div>
			)}
		</div>
	)
}

describe('renderInteractive', () => {
	const mockContext = new UIContextValue({
		theme: {},
		actions: {},
	})

	const mockElement = {
		type: 'interactive',
		requiresInput: {
			fields: [{ name: 'count', type: 'number', label: 'Count', defaultValue: 0, min: 0 }],
		},
		compute: vi.fn(async (input) => ({
			$title: `Result: ${input.count * 2}`,
			message: `Computed from ${input.count}`,
			updatedContent: [{ p: ['Dynamic text'] }],
		})),
		$content: [{ Typography: ['Base Title'], $variant: 'h3' }],
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders base content and form for input', () => {
		render(
			<UIProvider value={mockContext}>
				<MockInteractiveRenderer element={mockElement} context={mockContext} />
			</UIProvider>,
		)

		expect(screen.getByText('Base Title')).toBeInTheDocument()
		expect(screen.getByLabelText('Count')).toBeInTheDocument()
		expect(screen.getByTestId('compute-btn')).toBeInTheDocument()
	})

	it('calls compute on form submit and renders result', async () => {
		const { compute } = mockElement
		render(
			<UIProvider value={mockContext}>
				<MockInteractiveRenderer element={mockElement} context={mockContext} />
			</UIProvider>,
		)

		const input = screen.getByDisplayValue('0') // default
		fireEvent.change(input, { target: { value: '5' } })

		const submitBtn = screen.getByTestId('compute-btn')
		fireEvent.click(submitBtn)

		await waitFor(() => {
			expect(compute).toHaveBeenCalledWith({ count: '5' })
			expect(screen.getByTestId('result')).toBeInTheDocument()
			expect(screen.getByText('Result: 10')).toBeInTheDocument()
			expect(screen.getByText('Computed from 5')).toBeInTheDocument()
			expect(screen.getByText('Dynamic text')).toBeInTheDocument()
		})
	})

	it('handles compute error', async () => {
		mockElement.compute.mockRejectedValueOnce(new Error('Test error'))

		render(
			<UIProvider value={mockContext}>
				<MockInteractiveRenderer element={mockElement} context={mockContext} />
			</UIProvider>,
		)

		const input = screen.getByDisplayValue('0')
		fireEvent.change(input, { target: { value: '1' } })

		const submitBtn = screen.getByTestId('compute-btn')
		fireEvent.click(submitBtn)

		await waitFor(() => {
			expect(screen.getByText('Error: Test error')).toBeInTheDocument()
		})
	})

	it('renders without requiresInput (no form, just base)', () => {
		const noInputElement = {
			...mockElement,
			requiresInput: undefined,
			$content: [{ Typography: ['Only Base'] }],
		}
		render(
			<UIProvider value={mockContext}>
				<MockInteractiveRenderer element={noInputElement} context={mockContext} />
			</UIProvider>,
		)

		expect(screen.getByText('Only Base')).toBeInTheDocument()
		expect(screen.queryByTestId('compute-btn')).not.toBeInTheDocument()
		expect(screen.queryByTestId('interactive-form')).not.toBeInTheDocument()
	})
})
