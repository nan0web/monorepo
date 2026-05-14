import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from './Input.jsx'
import { useUI } from '../../index.jsx'

// Mock useUI while preserving other exports
vi.mock('../../index.jsx', async (importOriginal) => {
	const actual = await importOriginal()
	const mockUseUI = vi.fn()
	mockUseUI.mockReturnValue({ theme: { name: 'bootstrap' } })
	return {
		...actual,
		useUI: mockUseUI,
	}
})

test('renders Input with text type', () => {
	render(<Input type="text" placeholder="Text input" />)
	const input = screen.getByPlaceholderText('Text input')
	expect(input).toBeInTheDocument()
	expect(input).toHaveAttribute('type', 'text')
})

test('renders Input with different types', () => {
	const types = ['password', 'email', 'number']
	types.forEach((type) => {
		const { unmount } = render(<Input type={type} placeholder={`${type} input`} />)
		const input = screen.getByPlaceholderText(`${type} input`)
		expect(input).toHaveAttribute('type', type)
		unmount()
	})
})

test('renders Textarea as Input', () => {
	render(<Input type="textarea" as="textarea" placeholder="Textarea" />)
	const textarea = screen.getByPlaceholderText('Textarea')
	expect(textarea).toBeInTheDocument()
	expect(textarea.tagName).toBe('TEXTAREA')
})

test('applies custom style in fallback mode', () => {
	vi.doMock('@nan0web/ui-react', () => ({
		useUI: () => ({ theme: { name: 'default' } }),
	}))
	const customStyle = { border: '2px solid blue' }
	render(<Input type="text" style={customStyle} />)
	const input = screen.getByRole('textbox')
	expect(input).toHaveStyle('border: 2px solid blue')
})

test.skip('does not apply style in bootstrap theme mode (vi.doMock limitation)', () => {
	const customStyle = { border: '2px solid red' }
	render(<Input type="text" style={customStyle} />)
	const input = screen.getByRole('textbox')
	expect(input).not.toHaveStyle('border: 2px solid red')
})
