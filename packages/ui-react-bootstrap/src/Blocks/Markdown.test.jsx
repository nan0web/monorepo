import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Markdown } from './Markdown.jsx'

describe('Markdown component', () => {
	it('should render HTML content via dangerouslySetInnerHTML', () => {
		const { container } = render(<Markdown html="<strong>Bold syntax</strong>" />)
		const strongEl = container.querySelector('strong')
		expect(strongEl).toBeInTheDocument()
		expect(strongEl).toHaveTextContent('Bold syntax')
	})

	it('should render children when html/content is absent', () => {
		const { getByText } = render(
			<Markdown>
				<p>Child content paragraph</p>
			</Markdown>,
		)
		expect(getByText('Child content paragraph')).toBeInTheDocument()
	})
})
