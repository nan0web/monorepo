import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import Radio from './Radio.jsx'
import { UIProvider } from '../../context/UIContext.jsx'

const renderWithProvider = (ui) => {
	return render(<UIProvider value={{ theme: {} }}>{ui}</UIProvider>)
}

describe('Radio Component', () => {
	it('should render correctly', () => {
		renderWithProvider(<Radio name="test" />)
		expect(screen.getByRole('radio')).toBeDefined()
	})

	it('should toggle on click', () => {
		renderWithProvider(<Radio name="test" />)
		const radio = screen.getByRole('radio')
		expect(radio.checked).toBe(false)
		fireEvent.click(radio)
		expect(radio.checked).toBe(true)
	})

	it.todo('should sync within a group (uncontrolled)', async () => {
		renderWithProvider(
			<div>
				<Radio name="group1" data-testid="r1" defaultChecked={true} />
				<Radio name="group1" data-testid="r2" />
			</div>,
		)

		const r1 = screen.getByTestId('r1')
		const r2 = screen.getByTestId('r2')

		expect(r1.checked).toBe(true)
		expect(r2.checked).toBe(false)

		// Click R2 — use act to flush React state updates
		await act(async () => {
			fireEvent.click(r2)
		})

		// R2 should be checked, R1 should be NOT checked
		expect(r2.checked).toBe(true)
		expect(r1.checked).toBe(false)
	})

	it('should toggle off when clicked twice', () => {
		renderWithProvider(<Radio name="test" />)
		const radio = screen.getByRole('radio')

		fireEvent.click(radio)
		expect(radio.checked).toBe(true)

		fireEvent.click(radio)
		expect(radio.checked).toBe(false) // Custom behavior added: un-toggle when clicked again
	})
})
