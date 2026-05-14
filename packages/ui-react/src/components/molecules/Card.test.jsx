/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

describe('Card', () => {
	beforeEach(() => {
		// Create global style to define CSS variables for fallback support in test env
		const style = document.createElement('style')
		style.textContent = `
			:root {
				--color-background: rgb(255, 255, 255);
				--color-border: rgb(229, 231, 235);
			}
		`
		document.head.appendChild(style)
	})

	afterEach(() => {
		// Clean up styles
		const styles = document.head.querySelectorAll('style')
		styles.forEach((s) => s.remove())
	})

	it('renders children inside div with theme styles', () => {
		render(
			<UIProvider value={new UIContextValue({})}>
				<Card>
					<p>Card content</p>
				</Card>
			</UIProvider>,
		)
		const card = screen.getByText('Card content').parentElement
		const computed = window.getComputedStyle(card)
		expect(computed.padding).toBe('16px') // 1rem default
		expect(computed.backgroundColor).toBe('rgb(255, 255, 255)')
		expect(computed.borderRadius).toBe('8px')
		expect(computed.border).toBe('1px solid rgb(229, 231, 235)')
		expect(computed.boxShadow).toBe(
			'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
		)
	})

	it('forwards custom style and className', () => {
		render(
			<UIProvider value={new UIContextValue({})}>
				<Card style={{ border: '2px solid blue' }} className="custom-card">
					<p>Custom card</p>
				</Card>
			</UIProvider>,
		)
		const card = screen.getByText('Custom card').parentElement
		expect(card.style.border).toBe('2px solid blue')
		expect(card).toHaveClass('custom-card')
	})

	it('handles multiple children', () => {
		render(
			<UIProvider value={new UIContextValue({})}>
				<Card>
					<h3>Title</h3>
					<p>Paragraph</p>
					<button>Action</button>
				</Card>
			</UIProvider>,
		)
		expect(screen.getByText('Title')).toBeInTheDocument()
		expect(screen.getByText('Paragraph')).toBeInTheDocument()
		expect(screen.getByText('Action')).toBeInTheDocument()
	})
})
