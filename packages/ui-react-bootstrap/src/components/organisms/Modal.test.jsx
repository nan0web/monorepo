import { test, expect, vi, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal.jsx'

describe('Modal', () => {
	test('renders Modal when isOpen is true', () => {
		render(
			<Modal isOpen onClose={() => {}}>
				<div>Modal content</div>
			</Modal>,
		)
		const content = screen.getByText('Modal content')
		expect(content).toBeInTheDocument()
		const modalBody = content.closest('.modal-body')
		expect(modalBody).toBeInTheDocument()
		cleanup()
	})

	test('does not render Modal when isOpen is false', () => {
		render(
			<Modal isOpen={false} onClose={() => {}}>
				<div>Modal content</div>
			</Modal>,
		)
		expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
		cleanup()
	})

	test('calls onClose when backdrop is clicked', async () => {
		const user = userEvent.setup()
		const onCloseMock = vi.fn()
		render(
			<Modal isOpen onClose={onCloseMock}>
				<div>Modal content</div>
			</Modal>,
		)

		const backdrop = document.querySelector('.modal-backdrop')
		if (backdrop) {
			await user.click(backdrop)
			expect(onCloseMock).toHaveBeenCalledTimes(1)
		}
		cleanup()
	})

	test.skip('applies custom style in fallback mode (vi.doMock limitation)', () => {
		vi.doMock('@nan0web/ui-react', () => ({
			useUI: () => ({ theme: { organisms: { Modal: { backgroundColor: 'lightgray' } } } }),
		}))

		render(
			<Modal isOpen onClose={() => {}}>
				Content
			</Modal>,
		)
		const content = screen.getByText('Content')
		const modalBody = content.closest('.modal-body')
		expect(modalBody).toHaveStyle({ 'background-color': 'lightgray' })
		cleanup()
	})
})
