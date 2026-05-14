import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LangSelect } from './LangSelect.jsx'

describe('LangSelect component', () => {
	it('should render default locale', () => {
		const { getByRole } = render(<LangSelect locale="uk" />)
		const select = getByRole('combobox')
		expect(select).toBeInTheDocument()
		expect(select).toHaveValue('uk')
	})

	it('should list available locales', () => {
		const { getByRole } = render(<LangSelect locale="uk" />)
		const select = getByRole('combobox')

		expect(select.options.length).toBe(2)
		expect(select.options[0].text).toContain('Українська')
		expect(select.options[1].text).toContain('English')
	})

	it('should trigger onChange when item selected', () => {
		const changeMock = vi.fn()
		const { getByRole } = render(<LangSelect locale="uk" onChange={changeMock} />)

		const select = getByRole('combobox')
		fireEvent.change(select, { target: { value: 'en' } })

		expect(changeMock).toHaveBeenCalledWith('en')
	})
})
