/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import TextArea from './TextArea.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

const mockContext = new UIContextValue({})

describe('TextArea', () => {
	it('renders textarea with placeholder', () => {
		render(
			<UIProvider value={mockContext}>
				<TextArea placeholder="Enter text" />
			</UIProvider>,
		)
		const textarea = screen.getByPlaceholderText('Enter text')
		expect(textarea).toBeInTheDocument()
		expect(textarea.tagName).toBe('TEXTAREA')
	})

	it('handles value and onChange', () => {
		const handleChange = vi.fn()
		render(
			<UIProvider value={mockContext}>
				<TextArea value="initial" onChange={handleChange} />
			</UIProvider>,
		)
		const textarea = screen.getByDisplayValue('initial')
		expect(textarea).toHaveValue('initial')
		fireEvent.change(textarea, { target: { value: 'updated' } })
		expect(handleChange).toHaveBeenCalledWith(expect.any(Object))
		expect(handleChange).toHaveBeenCalledTimes(1)
	})

	it('applies rows and cols', () => {
		render(
			<UIProvider value={mockContext}>
				<TextArea rows={5} cols={30} />
			</UIProvider>,
		)
		const textarea = screen.getByRole('textbox')
		expect(textarea).toHaveAttribute('rows', '5')
		expect(textarea).toHaveAttribute('cols', '30')
	})

	it('uses theme height and styles', () => {
		const themeContext = new UIContextValue({
			theme: {
				atoms: {
					TextArea: { height: '150px', paddingY: '12px' },
				},
			},
		})
		render(
			<UIProvider value={themeContext}>
				<TextArea />
			</UIProvider>,
		)
		const textarea = screen.getByRole('textbox')
		expect(textarea).toHaveStyle({ height: '150px', paddingTop: '12px', paddingBottom: '12px' })
	})
})
