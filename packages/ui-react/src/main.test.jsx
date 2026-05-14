import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { NoConsole } from '@nan0web/log'
import UIReact from './UIReact.jsx'
import DB from '@nan0web/db'

const mockConsole = new NoConsole()
console = mockConsole

describe('UIReact', () => {
	beforeEach(() => {
		mockConsole.clear()
	})

	it('renders loading state initially', async () => {
		const db = new DB({
			predefined: [],
			fetch: () => new Promise(() => {}),
		})

		render(<UIReact db={db} uri="test.json" console={mockConsole} />)

		expect(screen.getByText('Loading…')).toBeInTheDocument()
	})

	it.todo('renders error when document fails to load', async () => {
		const db = new DB({
			predefined: [
				[
					'uk/error.json',
					{
						message: 'Failed to load document',
					},
				],
			],
			fetch: () => Promise.reject(new Error('Test error')),
		})
		await db.connect()

		render(<UIReact db={db} uri="uk/error" console={mockConsole} />)

		await waitFor(() => {
			expect(screen.getByText(/Failed to load document/)).toBeInTheDocument()
			expect(screen.getByText(/Test error/)).toBeInTheDocument()
		})
	})

	it('renders document content after loading', async () => {
		const db = new DB({
			predefined: [
				[
					'test.json',
					{
						$content: [{ Typography: ['Test content'] }],
						$lang: 'en',
					},
				],
			],
		})
		await db.connect()

		render(<UIReact db={db} uri="test.json" console={mockConsole} />)

		await waitFor(
			() => {
				expect(screen.getByText('Test content')).toBeInTheDocument()
			},
			{ timeout: 999 },
		)
	})
})
