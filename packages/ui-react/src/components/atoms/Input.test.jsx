/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Input from './Input.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

const mockContext = new UIContextValue({})

describe('Input', () => {
	it('renders text input by default', () => {
		render(
			<UIProvider value={mockContext}>
				<Input />
			</UIProvider>,
		)
		const input = screen.getByRole('textbox')
		expect(input).toHaveAttribute('type', 'text')
	})

	it('renders with specified type', () => {
		const typeConfigs = [
			{ type: 'email', selector: 'input[type="email"]' },
			{ type: 'password', selector: 'input[type="password"]' },
			{ type: 'number', selector: 'input[type="number"]' },
		]

		render(
			<UIProvider value={mockContext}>
				<div>
					{typeConfigs.map(({ type }, index) => (
						<Input key={index} type={type} data-testid={`input-${type}`} />
					))}
				</div>
			</UIProvider>,
		)

		typeConfigs.forEach(({ type }) => {
			const input = screen.getByTestId(`input-${type}`)
			expect(input).toHaveAttribute('type', type)
		})
	})

	it('applies placeholder', () => {
		render(
			<UIProvider value={mockContext}>
				<Input placeholder="Test placeholder" />
			</UIProvider>,
		)
		expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
	})

	it('handles value and onChange', () => {
		const handleChange = vi.fn()
		const { getByRole } = render(
			<UIProvider value={mockContext}>
				<Input value="initial" onChange={handleChange} />
			</UIProvider>,
		)
		const input = getByRole('textbox')
		expect(input).toHaveValue('initial')
		fireEvent.change(input, { target: { value: 'new' } })
		expect(handleChange).toHaveBeenCalledWith(expect.any(Object))
		expect(handleChange).toHaveBeenCalledTimes(1)
	})

	it('uses theme styles', () => {
		const themeContext = new UIContextValue({
			theme: {
				atoms: {
					Input: { borderRadius: '8px', paddingX: '16px' },
				},
			},
		})
		render(
			<UIProvider value={themeContext}>
				<Input />
			</UIProvider>,
		)
		const input = screen.getByRole('textbox')
		expect(input).toHaveStyle({ borderRadius: '8px', paddingLeft: '16px', paddingRight: '16px' })
	})
})
