import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button.jsx'
import { useUI } from '../../index.jsx'
import * as UIReact from '../../index.jsx'

// Mock useUI while preserving other exports
vi.mock('../../index.jsx', async (importOriginal) => {
	const actual = await importOriginal()
	const actualUseUI = actual.useUI
	const mockUseUI = vi.fn()
	mockUseUI.mockReturnValue({ theme: { name: 'bootstrap' } })
	return {
		...actual,
		useUI: mockUseUI,
	}
})

test('renders Button with primary variant', () => {
	render(<Button>Primary Button</Button>)
	const button = screen.getByRole('button', { name: 'Primary Button' })
	expect(button).toBeInTheDocument()
	expect(button).toHaveClass('btn', 'btn-primary')
})

test('renders Button with outline variant', () => {
	render(<Button outline>Outline Button</Button>)
	const button = screen.getByRole('button', { name: 'Outline Button' })
	expect(button).toHaveClass('btn-outline-primary')
})

test('renders Button with different sizes', () => {
	const sizes = ['sm', 'md', 'lg']
	sizes.forEach((size) => {
		const { unmount } = render(<Button size={size}>Size {size}</Button>)
		const button = screen.getByRole('button', { name: `Size ${size}` })
		expect(button).toHaveClass(`btn-${size}`)
		unmount() // Clean up between tests to avoid multiple elements
	})
})

test('renders disabled Button', () => {
	render(<Button disabled>Disabled</Button>)
	const button = screen.getByRole('button', { name: 'Disabled' })
	expect(button).toBeDisabled()
})

test('applies custom style in fallback mode', () => {
	vi.doMock('@nan0web/ui-react', () => ({
		useUI: () => ({ theme: { name: 'default' } }),
	}))
	const customStyle = { backgroundColor: 'red' }
	render(
		<Button style={customStyle} variant="secondary">
			Styled
		</Button>,
	)
	const button = screen.getByRole('button', { name: 'Styled' })
	expect(button).toHaveStyle('background-color: red')
})
