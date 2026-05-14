import { useState, useCallback, useRef, useEffect } from 'react'
import { Component } from '@nan0web/ui'

const { SortableList } = Component

/**
 * React hook that wraps `@nan0web/ui` headless `SortableList` with React state.
 *
 * @param {any[]} initialItems - Initial items list
 * @param {object} [options]
 * @param {string} [options.persist] - localStorage key for auto-save/restore
 * @param {function} [options.onChange] - External callback on order change
 * @returns {{ items: any[], moveUp: (i: number) => void, moveDown: (i: number) => void, moveTo: (from: number, to: number) => void, reset: () => void }}
 */
export default function useSortableList(initialItems, options = {}) {
	const { persist, onChange } = options

	// Resolve initial items — from localStorage if persist key exists
	const resolvedInitial = (() => {
		if (persist) {
			try {
				const stored = localStorage.getItem(persist)
				if (stored) return JSON.parse(stored)
			} catch {
				/* ignore */
			}
		}
		return initialItems
	})()

	const listRef = useRef(/** @type {any} */ (null))
	if (!listRef.current) {
		listRef.current = SortableList.create({ items: resolvedInitial })
	}

	const [items, setItems] = useState(() => listRef.current.getItems())

	// Sync to localStorage + external onChange
	const sync = useCallback(() => {
		const current = listRef.current.getItems()
		setItems(current)
		if (persist) {
			try {
				localStorage.setItem(persist, JSON.stringify(current))
			} catch {
				/* ignore */
			}
		}
		onChange?.(current)
	}, [persist, onChange])

	const moveUp = useCallback(
		(index) => {
			listRef.current.moveUp(index)
			sync()
		},
		[sync],
	)

	const moveDown = useCallback(
		(index) => {
			listRef.current.moveDown(index)
			sync()
		},
		[sync],
	)

	const moveTo = useCallback(
		(from, to) => {
			listRef.current.moveTo(from, to)
			sync()
		},
		[sync],
	)

	const reset = useCallback(() => {
		listRef.current.reset()
		sync()
		if (persist) {
			try {
				localStorage.removeItem(persist)
			} catch {
				/* ignore */
			}
		}
	}, [sync, persist])

	// Re-init when initialItems reference changes (skip first render)
	const prevItemsRef = useRef(initialItems)
	useEffect(() => {
		if (prevItemsRef.current === initialItems) return
		prevItemsRef.current = initialItems
		listRef.current = SortableList.create({ items: initialItems })
		sync()
	}, [initialItems]) // eslint-disable-line react-hooks/exhaustive-deps

	return { items, moveUp, moveDown, moveTo, reset }
}
