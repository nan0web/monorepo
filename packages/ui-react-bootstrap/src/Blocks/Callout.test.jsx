import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Callout } from './Callout.jsx'

describe('Callout component', () => {
	it('should render with default info type', () => {
		const { container, getByText } = render(<Callout content="Test default message" />)
		expect(getByText('Test default message')).toBeInTheDocument()
		expect(container.querySelector('.alert-info')).toBeInTheDocument()
	})

	it('should render warning type', () => {
		const { container, getByText } = render(<Callout type="warning" content="Warning message" />)
		expect(getByText('Warning message')).toBeInTheDocument()
		expect(container.querySelector('.alert-warning')).toBeInTheDocument()
	})

	it('should render with title', () => {
		const { getByText } = render(<Callout title="Alert Title" content="Message body" />)
		expect(getByText('Alert Title')).toBeInTheDocument()
		expect(getByText('Message body')).toBeInTheDocument()
	})
})
