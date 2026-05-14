/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Badge from './Badge.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

const mockContext = new UIContextValue({})

describe('Badge', () => {
	const variants = ['primary', 'secondary', 'success', 'danger']
	variants.forEach((variant) => {
		it(`renders ${variant} variant with correct background and white text`, () => {
			render(
				<UIProvider value={mockContext}>
					<Badge variant={variant}>{variant}</Badge>
				</UIProvider>,
			)
			const badge = screen.getByText(variant)
			expect(badge).toBeInTheDocument()
			const computedStyle = window.getComputedStyle(badge)
			expect(computedStyle.backgroundColor).not.toBe('transparent')
			// Match hex or rgb
			const isWhite =
				computedStyle.color === 'rgb(255, 255, 255)' || computedStyle.color === '#ffffff'
			expect(isWhite).toBe(true)
		})
	})

	// Special cases for dark text variants
	const darkTextVariants = ['warning', 'info']
	darkTextVariants.forEach((variant) => {
		it(`renders ${variant} variant with dark text`, () => {
			render(
				<UIProvider value={mockContext}>
					<Badge variant={variant}>{variant}</Badge>
				</UIProvider>,
			)
			const badge = screen.getByText(variant)
			expect(badge).toBeInTheDocument()
			const computedStyle = window.getComputedStyle(badge)
			const isDark = computedStyle.color === 'rgb(0, 0, 0)' || computedStyle.color === '#000000'
			expect(isDark).toBe(true)
		})
	})

	it('applies custom style', () => {
		render(
			<UIProvider value={mockContext}>
				<Badge style={{ fontSize: '20px' }}>Custom</Badge>
			</UIProvider>,
		)
		const badge = screen.getByText('Custom')
		expect(badge).toHaveStyle({ fontSize: '20px' })
	})
})
