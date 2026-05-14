/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import renderForm from './renderForm.jsx'
import { UIProvider } from '../context/UIContext.jsx'
import UIContextValue from '../context/UIContextValue.jsx'

describe('renderForm', () => {
	const baseContext = new UIContextValue({
		data: {
			user: { name: 'John' },
			countries: ['Ukraine', 'USA', 'Canada'],
		},
		actions: {
			updateName: () => {},
			updateCountry: () => {},
		},
	})

	it('renders form with input field', () => {
		const element = {
			form: [
				{
					label: 'Name',
					input: {
						type: 'text',
						name: 'name',
						$value: 'data:user.name',
						$onChange: 'action:updateName',
					},
				},
			],
		}

		render(
			<UIProvider value={baseContext}>{renderForm({ element, context: baseContext })}</UIProvider>,
		)

		expect(screen.getByLabelText('Name')).toBeInTheDocument()
		expect(screen.getByRole('textbox')).toBeInTheDocument()
	})

	it('renders form with select field', () => {
		const element = {
			form: [
				{
					label: 'Country',
					select: {
						name: 'country',
						$value: 'Ukraine',
						$onChange: 'action:updateCountry',
						$options: 'data:countries',
					},
				},
			],
		}

		render(
			<UIProvider value={baseContext}>{renderForm({ element, context: baseContext })}</UIProvider>,
		)

		expect(screen.getByLabelText('Country')).toBeInTheDocument()
		expect(screen.getByRole('combobox')).toBeInTheDocument()
	})

	it('applies additional props to form element', () => {
		const element = {
			form: [
				{
					input: {
						type: 'text',
						name: 'test',
					},
				},
			],
			id: 'test-form',
			className: 'test-class',
		}

		render(
			<UIProvider value={baseContext}>{renderForm({ element, context: baseContext })}</UIProvider>,
		)

		const form = screen.getByRole('form', { hidden: true })
		expect(form).toHaveAttribute('id', 'test-form')
		expect(form).toHaveClass('test-class')
	})
})
