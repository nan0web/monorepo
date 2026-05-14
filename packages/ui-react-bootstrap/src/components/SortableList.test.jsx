import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SortableList } from './SortableList.jsx'

// Mock useSortableList from @nan0web/ui-react
vi.mock('@nan0web/ui-react', () => ({
	useSortableList: (items, options) => {
		const [state, setState] = React.useState(items)
		return {
			items: state,
			moveUp: (idx) => {
				if (idx <= 0) return
				const next = [...state]
				;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
				setState(next)
				options?.onChange?.(next)
			},
			moveDown: (idx) => {
				if (idx >= state.length - 1) return
				const next = [...state]
				;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
				setState(next)
				options?.onChange?.(next)
			},
			moveTo: vi.fn(),
			reset: vi.fn(),
		}
	},
}))

const models = [
	{ id: 'qwen-3-32b', size: '32B' },
	{ id: 'llama-3.3-70b', size: '70B', deprecated: true },
	{ id: 'gpt-oss-120b', size: '120B' },
]

describe('SortableList', () => {
	it('renders list with numbered items', () => {
		render(<SortableList items={models} />)
		const list = screen.getByTestId('sortable-list')
		expect(list).toBeTruthy()
		expect(screen.getByText('1')).toBeTruthy()
		expect(screen.getByText('2')).toBeTruthy()
		expect(screen.getByText('3')).toBeTruthy()
	})

	it('renders item labels when no renderItem is provided', () => {
		render(<SortableList items={models} />)
		expect(screen.getByText('qwen-3-32b')).toBeTruthy()
		expect(screen.getByText('llama-3.3-70b')).toBeTruthy()
		expect(screen.getByText('gpt-oss-120b')).toBeTruthy()
	})

	it('supports custom renderItem', () => {
		render(
			<SortableList
				items={models}
				renderItem={(item) => (
					<span data-testid={`custom-${item.id}`}>
						{item.id} — {item.size}
					</span>
				)}
			/>,
		)
		expect(screen.getByTestId('custom-qwen-3-32b')).toBeTruthy()
		expect(screen.getByText('qwen-3-32b — 32B')).toBeTruthy()
	})

	it('disables up button for first item and down button for last', () => {
		render(<SortableList items={models} />)
		const upButtons = screen.getAllByLabelText(/Move item .+ up/)
		const downButtons = screen.getAllByLabelText(/Move item .+ down/)

		expect(upButtons[0].disabled).toBe(true)
		expect(downButtons[downButtons.length - 1].disabled).toBe(true)

		// Middle items should not be disabled
		expect(upButtons[1].disabled).toBe(false)
		expect(downButtons[0].disabled).toBe(false)
	})

	it('calls onReorder when items are moved down', () => {
		const onReorder = vi.fn()
		render(<SortableList items={models} onReorder={onReorder} />)

		const downButtons = screen.getAllByLabelText(/Move item .+ down/)
		fireEvent.click(downButtons[0])

		expect(onReorder).toHaveBeenCalledTimes(1)
		const newOrder = onReorder.mock.calls[0][0]
		expect(newOrder[0].id).toBe('llama-3.3-70b')
		expect(newOrder[1].id).toBe('qwen-3-32b')
	})

	it('renders nothing when items is empty', () => {
		const { container } = render(<SortableList items={[]} />)
		expect(container.innerHTML).toBe('')
	})
})
