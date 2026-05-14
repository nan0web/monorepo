import { useState, useEffect, useCallback } from 'react'

/**
 * Universal hook for synchronizing a filter string with the URL (hash or search param).
 * 
 * @param {Array<string>} validCategories - Array of valid categories/filters.
 * @param {string} defaultFilter - The default filter to use if none is in the URL.
 * @param {Function} navigateFn - Function to use for navigation (pushState/replaceState wrapper).
 */
export function useUrlFilter(validCategories = [], defaultFilter = 'all', navigateFn = null) {
	const [activeFilter, setActiveFilter] = useState(defaultFilter)

	// Sync activeFilter with URL hash or search params on mount or when categories change
	useEffect(() => {
		const hash = window.location.hash.replace('#', '')
		const params = new URLSearchParams(window.location.search)
		const tag = params.get('tag')
		const filter = tag || hash

		if (filter && validCategories.includes(filter)) {
			setActiveFilter(filter)
		}
	}, [validCategories])

	const handleFilterChange = useCallback((cat) => {
		setActiveFilter(cat)

		const url = new URL(window.location.href)
		if (cat === defaultFilter) {
			url.searchParams.delete('tag')
		} else {
			url.searchParams.set('tag', cat)
		}

		if (url.hash === `#${cat}`) url.hash = ''

		if (navigateFn) {
			navigateFn(url.pathname + url.search + url.hash)
		} else {
			window.history.pushState(null, '', url.pathname + url.search + url.hash)
			// Trigger popstate manually so WebRunner/App responds to the URL change if needed
			window.dispatchEvent(new PopStateEvent('popstate'))
		}
	}, [defaultFilter, navigateFn])

	return [activeFilter, handleFilterChange]
}

export default useUrlFilter
