import { test, expect, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { act } from 'react'
import Card from './Card.jsx'

describe('Card', () => {
	test('renders Card with children', () => {
		render(
			<Card>
				<div>Card content</div>
			</Card>,
		)
		const content = screen.getByText('Card content')
		const card = content.closest('.card')
		expect(card).toBeInTheDocument()
		cleanup()
	})

	test('renders Card without custom styles in bootstrap mode', () => {
		act(() => {
			render(<Card>Content</Card>)
		})
		const content = screen.getByText('Content')
		const card = content.closest('.card')
		expect(card).toBeInTheDocument()
		expect(card).not.toHaveStyle('padding: 1.5rem')
		cleanup()
	})

	test('renders Card with custom style in fallback mode', () => {
		const customStyle = { border: '2px solid green' }
		render(<Card style={customStyle}>Styled Card</Card>)
		const content = screen.getByText('Styled Card')
		const card = content.closest('.card')
		expect(card).toHaveStyle('border: 2px solid green')
		cleanup()
	})

	test('Card renders nested components', () => {
		render(
			<Card>
				<p>Nested text</p>
			</Card>,
		)
		expect(screen.getByText('Nested text')).toBeInTheDocument()
		cleanup()
	})
})
