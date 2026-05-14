import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Page } from './Page.jsx'

const navConfig = {
	items: [
		{ label: 'Home', url: '/' },
		{ label: 'Docs', url: '/docs' },
	],
	brand: { title: 'TestApp', url: '/' },
}

const sidebarConfig = {
	title: 'Documentation',
	items: [
		{ label: 'Getting Started', url: '/docs/start' },
		{
			label: 'API Reference',
			url: '/docs/api',
			children: [{ label: 'Core', url: '/docs/api/core' }],
		},
	],
}

describe('Page', () => {
	it('renders page layout with children', () => {
		render(
			<Page>
				<h1>Hello World</h1>
			</Page>,
		)
		const layout = screen.getByTestId('page-layout')
		expect(layout).toBeTruthy()
		expect(screen.getByText('Hello World')).toBeTruthy()
	})

	it('renders with Nav when nav prop is provided', () => {
		render(
			<Page nav={navConfig}>
				<p>Content</p>
			</Page>,
		)
		expect(screen.getAllByText('TestApp')[0]).toBeTruthy()
		expect(screen.getByText('Home')).toBeTruthy()
		expect(screen.getByText('Docs')).toBeTruthy()
	})

	it('renders with Sidebar when sidebar prop is provided', () => {
		render(
			<Page sidebar={sidebarConfig}>
				<p>Main Content</p>
			</Page>,
		)
		expect(screen.getByText('Documentation')).toBeTruthy()
		expect(screen.getByText('Getting Started')).toBeTruthy()
	})

	it('renders full layout with nav + sidebar + content', () => {
		render(
			<Page nav={navConfig} sidebar={sidebarConfig}>
				<article>Full Page</article>
			</Page>,
		)
		expect(screen.getAllByText('TestApp')[0]).toBeTruthy()
		expect(screen.getByText('Documentation')).toBeTruthy()
		expect(screen.getByText('Full Page')).toBeTruthy()
	})

	it('renders without sidebar when items are empty', () => {
		render(
			<Page sidebar={{ items: [], title: 'Empty' }}>
				<p>No sidebar</p>
			</Page>,
		)
		// Sidebar title should NOT render because items is empty
		expect(screen.queryByText('Empty')).toBeNull()
		expect(screen.getByText('No sidebar')).toBeTruthy()
	})
})
