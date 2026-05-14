import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Search } from './Search.jsx'

describe('Search component', () => {
	const dummyResults = [
		{ title: 'Result 1', url: '/p1', desc: 'desc 1', path: [{ label: 'Home' }] },
	]

	it('should render inline mode properly', () => {
		const { getByText, getByPlaceholderText } = render(
			<Search inline={true} query="query123" results={dummyResults} />,
		)
		expect(getByPlaceholderText('searchPlaceholder')).toHaveValue('query123')
		expect(getByText('Result 1')).toBeInTheDocument()
		expect(getByText('desc 1')).toBeInTheDocument()
	})

	it('should call onSearch when form is submitted', () => {
		const searchMock = vi.fn()
		const { getByRole } = render(<Search inline={true} onSearch={searchMock} />)
		const form = getByRole('searchbox').closest('form')
		fireEvent.submit(form)
		expect(searchMock).toHaveBeenCalledWith('')
	})

	it('should show "no results" state', () => {
		const { getByText } = render(<Search inline={true} query="none" results={[]} />)
		expect(getByText('noResults')).toBeInTheDocument()
	})
})
