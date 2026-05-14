/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button.jsx'

describe('Button', () => {
	it('renders children correctly', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByText('Click me')).toBeInTheDocument()
	})

	// Solid variants tests
	const solidVariants = [
		{ variant: 'primary', bg: '#0d6efd', color: '#fff' },
		{ variant: 'secondary', bg: '#6c757d', color: '#fff' },
		{ variant: 'success', bg: '#198754', color: '#fff' },
		{ variant: 'warning', bg: '#ffc107', color: '#212529' },
		{ variant: 'danger', bg: '#dc3545', color: '#fff' },
		{ variant: 'info', bg: '#0dcaf0', color: '#fff' },
	]

	solidVariants.forEach(({ variant, bg, color }) => {
		it(`applies solid ${variant} variant with correct background and text color`, () => {
			render(<Button variant={variant}>{variant}</Button>)
			const btn = screen.getByText(variant)
			expect(btn).toHaveStyle({ backgroundColor: bg, color })
		})
	})

	// Outline variants tests
	const outlineVariants = [
		{ variant: 'primary', color: '#0d6efd', border: '1px solid #0d6efd' },
		{ variant: 'secondary', color: '#6c757d', border: '1px solid #6c757d' },
		{ variant: 'success', color: '#198754', border: '1px solid #198754' },
		{ variant: 'warning', color: '#ffc107', border: '1px solid #ffc107' },
		{ variant: 'danger', color: '#dc3545', border: '1px solid #dc3545' },
		{ variant: 'info', color: '#0dcaf0', border: '1px solid #0dcaf0' },
	]

	outlineVariants.forEach(({ variant, color, border }) => {
		it(`applies outline ${variant} variant with transparent background, correct color and border`, () => {
			render(<Button variant={variant} outline>{`Outline ${variant}`}</Button>)
			const btn = screen.getByText(`Outline ${variant}`)
			expect(btn).toHaveStyle({
				backgroundColor: 'transparent',
				color,
				border,
			})
		})
	})

	it('applies link variant (no background, primary color, underline)', () => {
		render(<Button variant="link">Link</Button>)
		const btn = screen.getByText('Link')
		expect(btn).toHaveStyle({
			backgroundColor: 'transparent',
			color: '#0d6efd',
			textDecoration: 'underline',
		})
	})

	it('applies small size adjustments', () => {
		render(<Button size="sm">Small</Button>)
		const btn = screen.getByText('Small')
		expect(btn.style.fontSize).toBe('0.875rem')
		expect(btn.style.padding).toBe('0.25rem 0.5rem')
	})

	it('styles disabled button with reduced opacity and not-allowed cursor', () => {
		render(<Button disabled>Disabled</Button>)
		const btn = screen.getByText('Disabled')
		expect(btn.style.opacity).toBe('0.65')
		expect(btn.style.cursor).toBe('not-allowed')
	})

	it('keyboard interaction – Enter triggers active style and reverts', () => {
		const { rerender } = render(<Button variant="success">Enter Test</Button>)
		let btn = screen.getByText('Enter Test')
		const initialTransform = btn.style.transform

		expect(initialTransform).toBe('scale(1)')

		// Simulate key down to activate
		fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' })
		// Rerender to apply state changes
		rerender(<Button>Enter Test</Button>)
		btn = screen.getByText('Enter Test')
		const activeTransform = btn.style.transform
		expect(activeTransform).toBe('scale(0.98)')

		// Simulate key up to revert
		fireEvent.keyUp(btn, { key: 'Enter', code: 'Enter' })
		rerender(<Button>Enter Test</Button>)
		const afterTransform = screen.getByText('Enter Test').style.transform
		expect(afterTransform).toBe('scale(1)')
	})
})
