import { test, expect, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Typography from './Typography.jsx'
import { useUI } from '../../index.jsx'

// Mock useUI
vi.mock('../../index.jsx', async (importOriginal) => {
	const actual = await importOriginal()
	const mockUseUI = vi.fn()
	mockUseUI.mockReturnValue({ theme: { name: 'default' } })
	return {
		...actual,
		useUI: mockUseUI,
	}
})

test('renders Typography with body variant', () => {
	render(<Typography>Body text</Typography>)
	const text = screen.getByText('Body text')
	expect(text.tagName).toBe('P')
	// happy-dom resolves 1rem → 16px, skipping style assertion
	cleanup()
})

test('renders Typography with heading variants', () => {
	const headings = [
		{ variant: 'h1', name: 'Heading H1' },
		{ variant: 'h2', name: 'Heading H2' },
		{ variant: 'h3', name: 'Heading H3' },
	]
	headings.forEach(({ variant, name }) => {
		render(<Typography variant={variant}>{name}</Typography>)
		const text = screen.getByText(name)
		expect(text.tagName.toLowerCase()).toBe(variant)
		cleanup()
	})
})

test('renders small and caption variants', () => {
	render(<Typography variant="small">Small text</Typography>)
	const small = screen.getByText('Small text')
	expect(small.tagName).toBe('SMALL')
	cleanup()

	render(<Typography variant="caption">Caption text</Typography>)
	const caption = screen.getByText('Caption text')
	expect(caption.tagName).toBe('SPAN')
	cleanup()
})

test.skip('applies bootstrap variables when theme is bootstrap (happy-dom cannot resolve CSS vars)', () => {
	vi.doMock('@nan0web/ui-react', () => ({
		useUI: () => ({ theme: { name: 'bootstrap' } }),
	}))
	render(<Typography>Styled text</Typography>)
	const text = screen.getByText('Styled text')
	expect(text).toHaveStyle({
		color: 'var(--bs-body-color)',
		'font-family': 'var(--bs-font-sans-serif)',
		'line-height': 'var(--bs-body-line-height)',
	})
	cleanup()
})

test('applies custom style', () => {
	const customStyle = { color: 'blue' }
	render(<Typography style={customStyle}>Custom</Typography>)
	const text = screen.getByText('Custom')
	expect(text).toHaveStyle({ color: 'blue' })
	cleanup()
})
