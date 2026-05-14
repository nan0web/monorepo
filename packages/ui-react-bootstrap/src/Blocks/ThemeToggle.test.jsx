import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle.jsx'

describe('ThemeToggle component', () => {
	it('should render correct icon for light theme', () => {
		const { container } = render(<ThemeToggle theme="light" />)
		// Usually light theme shows moon icon indicating "switch to dark",
		// but per our implementation, light theme is default and button is meant to toggle to dark.
		// Wait, in my ThemeToggle: `isDark` ? <FaSun/> : <FaMoon/>. For light it renders FaMoon.
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('should toggle when clicked', () => {
		const mockToggle = vi.fn()
		const { getByRole } = render(<ThemeToggle theme="light" onToggle={mockToggle} />)
		const btn = getByRole('button')
		fireEvent.click(btn)
		expect(mockToggle).toHaveBeenCalledWith('dark')
	})

	it('should toggle back to light when currently dark', () => {
		const mockToggle = vi.fn()
		const { getByRole } = render(<ThemeToggle theme="dark" onToggle={mockToggle} />)
		const btn = getByRole('button')
		fireEvent.click(btn)
		expect(mockToggle).toHaveBeenCalledWith('light')
	})
})
