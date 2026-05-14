/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

describe('Modal', () => {
	const mockOnClose = vi.fn()
	const mockContext = new UIContextValue({
		theme: {
			organisms: {
				Modal: {
					overlayBackground: 'rgba(0, 0, 0, 0.5)',
					borderRadius: '0.5rem',
					boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
					padding: '1.5rem',
					backgroundColor: '#ffffff',
				},
			},
		},
	})

	it('does not render when isOpen=false', () => {
		render(
			<UIProvider value={mockContext}>
				<Modal isOpen={false} onClose={mockOnClose}>
					<p>Modal content</p>
				</Modal>
			</UIProvider>,
		)
		expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
	})

	it('renders overlay and content when isOpen=true', () => {
		render(
			<UIProvider value={mockContext}>
				<Modal isOpen={true} onClose={mockOnClose}>
					<p>Modal content</p>
				</Modal>
			</UIProvider>,
		)

		const overlay = screen.getByTestId('modal-overlay')
		const modal = screen.getByTestId('modal-content')

		expect(overlay).toBeInTheDocument()
		expect(modal).toBeInTheDocument()

		// Check overlay inline styles
		expect(overlay.style.position).toBe('fixed')
		expect(overlay.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)')
		expect(overlay.style.display).toBe('flex')

		// Check modal inline styles - expect string values as set
		expect(modal.style.borderRadius).toBe('0.5rem')
		expect(modal.style.boxShadow).toBe('0 25px 50px -12px rgba(0, 0, 0, 0.25)')
		expect(modal.style.padding).toBe('1.5rem') // Inline is rem
		expect(modal.style.backgroundColor).toBe('#ffffff')
		expect(modal.style.width).toBe('90vw')
		expect(modal.style.maxWidth).toBe('500px')
		expect(modal.style.maxHeight).toBe('90vh')
		expect(modal.style.overflow).toBe('auto')

		// Optional: check computed for px values if needed
		const computed = window.getComputedStyle(modal)
		expect(computed.padding).toMatch(/24px/) // Computed rem to px
	})

	it('calls onClose on overlay click but not on modal click', () => {
		render(
			<UIProvider value={mockContext}>
				<Modal isOpen={true} onClose={mockOnClose}>
					<p>Click me</p>
				</Modal>
			</UIProvider>,
		)

		const overlay = screen.getByTestId('modal-overlay')
		const modal = screen.getByTestId('modal-content')

		fireEvent.click(overlay)
		expect(mockOnClose).toHaveBeenCalledTimes(1)

		mockOnClose.mockClear()
		fireEvent.click(modal)
		expect(mockOnClose).not.toHaveBeenCalled()
	})

	it('applies custom styles to modal', () => {
		render(
			<UIProvider value={mockContext}>
				<Modal isOpen={true} onClose={mockOnClose} style={{ width: '300px' }}>
					<p>Wide modal</p>
				</Modal>
			</UIProvider>,
		)

		const modal = screen.getByTestId('modal-content')
		expect(modal.style.width).toBe('300px')
	})
})
