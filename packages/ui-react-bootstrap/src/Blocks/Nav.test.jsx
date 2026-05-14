import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Nav } from './Nav.jsx'

describe('Nav component', () => {
	it('should render brand', () => {
		const { getAllByText } = render(<Nav brand={{ title: 'MyBrand' }} />)
		// It renders in Brand and Offcanvas Title
		expect(getAllByText('MyBrand').length).toBeGreaterThan(0)
	})

	it('should render items correctly', () => {
		const items = [
			{ title: 'Home', url: '/' },
			{ label: 'About', url: '/about' },
		]
		const { getByText } = render(<Nav items={items} />)

		expect(getByText('Home')).toHaveAttribute('href', '/')
		expect(getByText('About')).toHaveAttribute('href', '/about')
	})

	it('should render items with children as dropdowns', () => {
		const items = [
			{ title: 'Home', url: '/' },
			{
				title: 'Services',
				children: [{ title: 'Design', url: '/design' }],
			},
		]
		const { getByText } = render(<Nav items={items} />)

		expect(getByText('Services')).toBeInTheDocument()

		// Click to open dropdown
		fireEvent.click(getByText('Services'))

		expect(getByText('Design')).toHaveAttribute('href', '/design')
	})
})
