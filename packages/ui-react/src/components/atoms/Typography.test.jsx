/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Typography from './Typography.jsx'
import { UIProvider } from '../../context/UIContext.jsx'
import UIContextValue from '../../context/UIContextValue.jsx'

const mockContext = new UIContextValue({})

const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'caption']

describe('Typography', () => {
	variants.forEach((variant) => {
		it(`renders variant ${variant} with correct HTML element`, () => {
			const text = `Variant ${variant}`
			render(
				<UIProvider value={mockContext}>
					<Typography variant={variant}>{text}</Typography>
				</UIProvider>,
			)

			const element = screen.getByText(text)
			const tagMap = {
				h1: 'H1',
				h2: 'H2',
				h3: 'H3',
				h4: 'H4',
				h5: 'H5',
				h6: 'H6',
				body: 'P',
				small: 'SMALL',
				caption: 'SPAN',
			}
			const expectedTag = tagMap[variant] || 'P'
			expect(element.tagName).toBe(expectedTag)
		})
	})

	it('applies custom style prop', () => {
		render(
			<UIProvider value={mockContext}>
				<Typography style={{ color: 'red' }}>Styled</Typography>
			</UIProvider>,
		)
		const el = screen.getByText('Styled')
		expect(el).toHaveStyle({ color: 'red' })
	})
})
