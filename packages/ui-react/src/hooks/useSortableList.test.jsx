import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useSortableList from './useSortableList.js'

// Mock localStorage for happy-dom
const store = {}
const mockStorage = {
	getItem: vi.fn((key) => store[key] ?? null),
	setItem: vi.fn((key, val) => {
		store[key] = String(val)
	}),
	removeItem: vi.fn((key) => {
		delete store[key]
	}),
	clear: vi.fn(() => {
		for (const k in store) delete store[k]
	}),
}
Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true })

describe('useSortableList', () => {
	const models = [
		{ id: 'llama', label: 'Llama 3.3' },
		{ id: 'qwen', label: 'Qwen 2.5' },
		{ id: 'deepseek', label: 'DeepSeek R1' },
	]

	beforeEach(() => {
		for (const k in store) delete store[k]
	})

	it('returns initial items', () => {
		const { result } = renderHook(() => useSortableList(models))
		expect(result.current.items).toEqual(models)
	})

	it('moveUp swaps item with previous', () => {
		const { result } = renderHook(() => useSortableList(models))

		act(() => result.current.moveUp(1))

		expect(result.current.items[0].id).toBe('qwen')
		expect(result.current.items[1].id).toBe('llama')
		expect(result.current.items[2].id).toBe('deepseek')
	})

	it('moveDown swaps item with next', () => {
		const { result } = renderHook(() => useSortableList(models))

		act(() => result.current.moveDown(0))

		expect(result.current.items[0].id).toBe('qwen')
		expect(result.current.items[1].id).toBe('llama')
	})

	it('moveTo moves item from one position to another', () => {
		const { result } = renderHook(() => useSortableList(models))

		act(() => result.current.moveTo(2, 0))

		expect(result.current.items[0].id).toBe('deepseek')
		expect(result.current.items[1].id).toBe('llama')
		expect(result.current.items[2].id).toBe('qwen')
	})

	it('reset restores initial order', () => {
		const { result } = renderHook(() => useSortableList(models))

		act(() => result.current.moveDown(0))
		act(() => result.current.moveDown(1))
		act(() => result.current.reset())

		expect(result.current.items).toEqual(models)
	})

	it('moveUp(0) is a no-op', () => {
		const { result } = renderHook(() => useSortableList(models))

		act(() => result.current.moveUp(0))

		expect(result.current.items).toEqual(models)
	})

	it('moveDown(last) is a no-op', () => {
		const { result } = renderHook(() => useSortableList(models))

		act(() => result.current.moveDown(2))

		expect(result.current.items).toEqual(models)
	})

	it('persist saves to localStorage', () => {
		const key = 'test_sort_order'
		const { result } = renderHook(() => useSortableList(models, { persist: key }))

		act(() => result.current.moveDown(0))

		const stored = JSON.parse(store[key])
		expect(stored[0].id).toBe('qwen')
		expect(stored[1].id).toBe('llama')
	})

	it('persist restores from localStorage on init', () => {
		const key = 'test_sort_order'
		const reordered = [models[2], models[0], models[1]]
		store[key] = JSON.stringify(reordered)

		const { result } = renderHook(() => useSortableList(models, { persist: key }))

		expect(result.current.items[0].id).toBe('deepseek')
	})

	it('reset clears localStorage', () => {
		const key = 'test_sort_order'
		const { result } = renderHook(() => useSortableList(models, { persist: key }))

		act(() => result.current.moveDown(0))
		expect(store[key]).toBeDefined()

		act(() => result.current.reset())
		expect(store[key]).toBeUndefined()
	})

	it('onChange callback is called on reorder', () => {
		const onChange = vi.fn()
		const { result } = renderHook(() => useSortableList(models, { onChange }))
		const initCalls = onChange.mock.calls.length

		act(() => result.current.moveUp(1))

		expect(onChange).toHaveBeenCalledTimes(initCalls + 1)
		expect(onChange).toHaveBeenLastCalledWith(
			expect.arrayContaining([expect.objectContaining({ id: 'qwen' })]),
		)
	})
})
