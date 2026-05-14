/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import renderTable from './renderTable.jsx'

describe('renderTable', () => {
	it('renders table with content', () => {
		const element = {
			table: (
				<tbody>
					<tr>
						<td>Test Cell</td>
					</tr>
				</tbody>
			),
			id: 'test-table',
		}

		render(renderTable({ element }))
		expect(screen.getByRole('table')).toBeInTheDocument()
		expect(screen.getByText('Test Cell')).toBeInTheDocument()
	})

	it('applies additional props to table element', () => {
		const element = {
			table: <tbody></tbody>,
			className: 'table-class',
		}

		render(renderTable({ element }))
		const table = screen.getByRole('table')
		expect(table).toHaveClass('table-class')
	})
})
