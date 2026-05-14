import { useState, useCallback } from 'react'

export function calculateNewPath(prevPath, id, level) {
	if (prevPath.includes(id)) {
		return prevPath.filter((p) => {
			const pLevel = parseInt(p.split('-')[0], 10)
			return pLevel < level
		})
	} else {
		const newPath = prevPath.filter((p) => {
			const pLevel = parseInt(p.split('-')[0], 10)
			return pLevel < level
		})
		return [...newPath, id]
	}
}

export function useHeaderNav(initialPath = []) {
	const [activePath, setActivePath] = useState(initialPath)

	const handleToggle = useCallback((id, level) => {
		setActivePath((prev) => calculateNewPath(prev, id, level))
	}, [])

	return { activePath, handleToggle }
}
