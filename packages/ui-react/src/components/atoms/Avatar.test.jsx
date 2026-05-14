/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import Avatar from './Avatar.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

describe('Avatar', () => {
	const mockTheme = {
		atoms: {
			Avatar: {
				size: '40px',
				borderRadius: '50%',
				border: '1px solid #e5e7eb',
				backgroundColor: '#f3f4f6',
				fallbackColor: '#9ca3af',
				fallbackTextColor: '#6b7280',
			},
		},
	}

	const mockContext = new UIContextValue({ theme: mockTheme })

	it('renders with image when src is provided', () => {
		render(
			<UIProvider value={mockContext}>
				<Avatar src="https://via.placeholder.com/40" alt="User Avatar" />
			</UIProvider>,
		)
		expect(screen.getByAltText('User Avatar')).toBeInTheDocument()
		const container = screen.getByAltText('User Avatar').parentElement
		expect(container.style.width).toBe('40px')
		expect(container.style.height).toBe('40px')
		expect(container.style.borderRadius).toBe('50%')
		expect(container.style.border).toBe('1px solid #e5e7eb')
	})

	it('renders fallback when no src', () => {
		render(
			<UIProvider value={mockContext}>
				<Avatar alt="John Doe" />
			</UIProvider>,
		)
		expect(screen.getByRole('img')).toBeInTheDocument()
		expect(screen.getByText('JD')).toBeInTheDocument()
		const container = screen.getByRole('img').closest('div')
		expect(container.style.width).toBe('40px')
		expect(container.style.height).toBe('40px')
		expect(container.style.borderRadius).toBe('50%')
		expect(container.style.border).toBe('1px solid #e5e7eb')
	})

	it('switches to fallback on image load error', async () => {
		render(
			<UIProvider value={mockContext}>
				<Avatar src="invalid.jpg" alt="Failed" />
			</UIProvider>,
		)
		const img = screen.getByAltText('Failed')
		await act(async () => {
			fireEvent.error(img)
		})
		await waitFor(() => {
			expect(screen.getByText('F')).toBeInTheDocument()
		})
		const fallbackDiv = screen.getByText('F').parentElement
		expect(fallbackDiv.outerHTML).toContain('background-color: #9ca3af')
		expect(fallbackDiv.outerHTML).toContain('color: #6b7280')
	})

	it('applies custom style and className', () => {
		render(
			<UIProvider value={mockContext}>
				<Avatar
					src="test.jpg"
					alt="Test"
					style={{ border: '2px solid red' }}
					className="test-class"
				/>
			</UIProvider>,
		)
		const container = screen.getByAltText('Test').parentElement
		expect(container.style.border).toBe('2px solid red')
		expect(container.className).toBe('test-class')
	})

	it('uses theme defaults when no custom theme', () => {
		const defaultContext = new UIContextValue({ theme: null })
		render(
			<UIProvider value={defaultContext}>
				<Avatar src="test.jpg" alt="Default" />
			</UIProvider>,
		)
		const container = screen.getByAltText('Default').parentElement
		expect(container.style.width).toBe('2.5rem')
		expect(container.style.height).toBe('2.5rem')
		expect(container.style.borderRadius).toBe('9999px')
	})
})
