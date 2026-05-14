/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Checkbox from './Checkbox.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

const mockContext = new UIContextValue({})

describe('Checkbox', () => {
	it('renders unchecked by default', () => {
		const handleChange = vi.fn()
		render(
			<UIProvider value={mockContext}>
				<Checkbox onChange={handleChange} />
			</UIProvider>,
		)
		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).not.toBeChecked()
	})

	it('renders checked when checked=true', () => {
		render(
			<UIProvider value={mockContext}>
				<Checkbox checked />
			</UIProvider>,
		)
		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toBeChecked()
	})

	it('calls onChange on click', () => {
		const handleChange = vi.fn()
		render(
			<UIProvider value={mockContext}>
				<Checkbox onChange={handleChange} />
			</UIProvider>,
		)
		const checkbox = screen.getByRole('checkbox')
		fireEvent.click(checkbox)
		expect(handleChange).toHaveBeenCalledTimes(1)
	})

	it('applies disabled state', () => {
		render(
			<UIProvider value={mockContext}>
				<Checkbox disabled />
			</UIProvider>,
		)
		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toBeDisabled()
		expect(checkbox).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' })
	})

	it('uses theme styles', () => {
		const themeContext = new UIContextValue({
			theme: {
				atoms: {
					Checkbox: { size: '20px', checkedColor: 'red' },
				},
			},
		})
		render(
			<UIProvider value={themeContext}>
				<Checkbox checked />
			</UIProvider>,
		)
		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toHaveStyle({
			width: '20px',
			height: '20px',
			backgroundColor: 'red',
			borderRadius: '3px',
		})
	})
})
