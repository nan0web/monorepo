/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RenderButton from './renderButton.jsx'
import React from 'react'
import { UIProvider } from '../context/UIContext.jsx'

// Mock ReactElement to avoid circular dependency issues during testing
vi.mock('../Element.jsx', () => ({
	default: {
		render: vi.fn((item, key) => <span key={key}>{typeof item === 'string' ? item : JSON.stringify(item)}</span>),
	},
}))

describe('renderButton', () => {
	it('renders content from element value when used as renderer', () => {
		// e.g. - button: Click Me
		const props = { element: { button: 'Click Me' } }
		render(<UIProvider><RenderButton {...props} /></UIProvider>)
		expect(screen.getByText('Click Me')).toBeInTheDocument()
	})

	it('renders content from props.content', () => {
		const props = { element: {}, content: 'Explicit Content' }
		render(<UIProvider><RenderButton {...props} /></UIProvider>)
		expect(screen.getByText('Explicit Content')).toBeInTheDocument()
	})

	it('renders content from props.children', () => {
		const props = { element: {}, children: 'Child Content' }
		render(<UIProvider><RenderButton {...props} /></UIProvider>)
		expect(screen.getByText('Child Content')).toBeInTheDocument()
	})

	it('renders array content using ReactElement.render', () => {
		const content = ['Part 1', 'Part 2']
		const props = { element: {}, content }
		render(<UIProvider><RenderButton {...props} /></UIProvider>)
		expect(screen.getByText('Part 1')).toBeInTheDocument()
		expect(screen.getByText('Part 2')).toBeInTheDocument()
	})

	it('defaults to "Button" if empty', () => {
		const props = { element: {} }
		render(<UIProvider><RenderButton {...props} /></UIProvider>)
		expect(screen.getByText('Button')).toBeInTheDocument()
	})
})
