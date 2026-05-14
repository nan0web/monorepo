import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Alert } from './Alert.jsx'

describe('Alert component', () => {
	it('should render with default info type when no type or className', () => {
		const { container, getByText } = render(<Alert content="Test default message" />)
		expect(getByText('Test default message')).toBeInTheDocument()
		expect(container.querySelector('.alert-info')).toBeInTheDocument()
	})

	it('should render warning via explicit type prop', () => {
		const { container, getByText } = render(<Alert type="warning" content="Warning message" />)
		expect(getByText('Warning message')).toBeInTheDocument()
		expect(container.querySelector('.alert-warning')).toBeInTheDocument()
	})

	it('should render danger via className (dot-notation)', () => {
		const { container, getByText } = render(<Alert className="danger" content="Danger via class" />)
		expect(getByText('Danger via class')).toBeInTheDocument()
		expect(container.querySelector('.alert-danger')).toBeInTheDocument()
	})

	it('should render with title', () => {
		const { getByText } = render(<Alert title="Alert Title" content="Message body" />)
		expect(getByText('Alert Title')).toBeInTheDocument()
		expect(getByText('Message body')).toBeInTheDocument()
	})
})
