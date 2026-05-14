/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Select from './Select.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

const mockContext = new UIContextValue({})
const options = [
	{ value: '1', label: 'Option 1' },
	{ value: '2', label: 'Option 2' },
]

describe('Select', () => {
	it('renders with options', () => {
		render(
			<UIProvider value={mockContext}>
				<Select options={options} />
			</UIProvider>,
		)
		const select = screen.getByRole('combobox')
		expect(select).toBeInTheDocument()
		expect(screen.getByText('Option 1')).toBeInTheDocument()
		expect(screen.getByText('Option 2')).toBeInTheDocument()
	})

	it('handles value and onChange', () => {
		const handleChange = vi.fn()
		render(
			<UIProvider value={mockContext}>
				<Select options={options} value="1" onChange={handleChange} />
			</UIProvider>,
		)
		const select = screen.getByRole('combobox')
		expect(select).toHaveValue('1')
		fireEvent.change(select, { target: { value: '2' } })
		expect(handleChange).toHaveBeenCalledWith(expect.any(Object))
		expect(handleChange).toHaveBeenCalledTimes(1)
	})

	it('renders string options', () => {
		render(
			<UIProvider value={mockContext}>
				<Select options={['Opt1', 'Opt2']} />
			</UIProvider>,
		)
		expect(screen.getByText('Opt1')).toBeInTheDocument()
		expect(screen.getByText('Opt2')).toBeInTheDocument()
	})

	it('applies theme styles', () => {
		const themeContext = new UIContextValue({
			theme: {
				atoms: {
					Select: { borderRadius: '6px', fontSize: '16px' },
				},
			},
		})
		render(
			<UIProvider value={themeContext}>
				<Select options={options} />
			</UIProvider>,
		)
		const select = screen.getByRole('combobox')
		expect(select).toHaveStyle({ borderRadius: '6px', fontSize: '16px' })
	})
})
