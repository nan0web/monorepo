import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LangSelect } from './LangSelect.jsx'

describe('LangSelect component', () => {
	it('should render default locale', () => {
		const { getByText } = render(<LangSelect locale="uk" />)
		expect(getByText('uk')).toBeInTheDocument()
	})

	it('should list available locales when clicked', () => {
		const { getByText } = render(<LangSelect locale="uk" />)
		const toggle = getByText('uk')
		fireEvent.click(toggle) // open dropdown

		expect(getByText('Українська')).toBeInTheDocument()
		expect(getByText('English')).toBeInTheDocument()
	})

	it('should trigger onChange when item clicked', () => {
		const changeMock = vi.fn()
		const { getByText } = render(<LangSelect locale="uk" onChange={changeMock} />)

		fireEvent.click(getByText('uk')) // open dropdown
		fireEvent.click(getByText('English')) // select en

		expect(changeMock).toHaveBeenCalledWith('en')
	})
})
