import { test, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import Playground from './Playground.jsx'
import { UIProvider, BootstrapTheme } from '../src/index.jsx'

let originalFetch

beforeAll(() => {
	originalFetch = global.fetch
})

afterAll(() => {
	global.fetch = originalFetch
})

test('renders Playground with declarative content from JSON', async () => {
	const mockFetchData = {
		$content: [
			{ h1: 'Test Playground' },
			{ Typography: { variant: 'body', children: 'Test content' } },
			{ Button: 'Test Button', $variant: 'primary' },
		],
	}

	global.fetch = vi.fn(() =>
		Promise.resolve({
			ok: true,
			json: () => Promise.resolve(mockFetchData),
		}),
	)

	render(
		<UIProvider context={{ theme: BootstrapTheme }}>
			<Playground />
		</UIProvider>,
	)

	await waitFor(() => {
		expect(screen.getByText('Test Playground')).toBeInTheDocument()
	})

	expect(screen.getByText('Test content')).toBeInTheDocument()

	const button = screen.getByRole('button')
	expect(button).toBeInTheDocument()
	expect(button).toHaveClass('btn-primary')
})

test('renders error message when fetch fails', async () => {
	global.fetch = vi.fn(() => Promise.reject(new Error('Fetch failed')))

	render(
		<UIProvider context={{ theme: BootstrapTheme }}>
			<Playground />
		</UIProvider>,
	)

	await waitFor(
		() => {
			const errorText = screen.getByText(/Error loading content/)
			expect(errorText).toBeInTheDocument()
			expect(screen.getByText(/pnpm build-data/)).toBeInTheDocument()
		},
		{ timeout: 2000 },
	)
})
