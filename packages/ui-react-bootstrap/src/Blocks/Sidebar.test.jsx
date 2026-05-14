import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Sidebar } from './Sidebar.jsx'

describe('Sidebar component', () => {
	it('should display the title if provided', () => {
		const { getByText } = render(<Sidebar title="Main Navigation" items={[]} />)
		expect(getByText('Main Navigation')).toBeInTheDocument()
	})

	it('should render items correctly', () => {
		const items = [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Settings', url: '/settings' },
		]
		const { getByText } = render(<Sidebar items={items} />)

		const dashLink = getByText('Dashboard')
		expect(dashLink).toHaveAttribute('href', '/dash')
		expect(getByText('Settings')).toHaveAttribute('href', '/settings')
	})

	it('should highlight active items', () => {
		const items = [
			{ title: 'Home', url: '/', active: true },
			{ title: 'Profile', url: '/profile', active: false },
		]
		const { getByText } = render(<Sidebar items={items} />)

		const activeItem = getByText('Home')
		expect(activeItem).toHaveClass('active')
		expect(activeItem).toHaveClass('fw-bold')
		expect(activeItem).toHaveClass('text-primary')

		const inactiveItem = getByText('Profile')
		expect(inactiveItem).not.toHaveClass('active')
		expect(inactiveItem).toHaveClass('text-body')
	})
})
