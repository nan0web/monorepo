import { useState, useEffect, useCallback } from 'react'

/**
 * Universal hook for managing compared items.
 * Persists the list of item IDs to localStorage.
 * 
 * @param {string} storageKey - Key to use for localStorage.
 * @param {Array<string>} initialValue - Initial array of IDs if storage is empty.
 */
export function useCompare(storageKey = 'olmui_compare_items', initialValue = []) {
	const [compareIds, setCompareIds] = useState(() => {
		try {
			const saved = localStorage.getItem(storageKey)
			return saved ? JSON.parse(saved) : initialValue
		} catch (e) {
			return initialValue
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(compareIds))
		} catch (e) {
			// ignore quota errors
		}
	}, [compareIds, storageKey])

	const toggleCompare = useCallback((id) => {
		setCompareIds((prev) => {
			if (prev.includes(id)) return prev.filter((i) => i !== id)
			return [...prev, id]
		})
	}, [])

	const clearCompare = useCallback(() => {
		setCompareIds([])
	}, [])

	return {
		compareIds,
		toggleCompare,
		clearCompare,
		setCompareIds
	}
}

export default useCompare
