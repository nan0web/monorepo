import { useState, useEffect } from 'react'

/**
 * Universal hook for loading and hydrating Document Indexes (OLMUI Pattern).
 * Fetches JSON from DBFS, unminifies properties using $index.fields, and instantiates models.
 * 
 * @param {import('@nan0web/db-browser').default} db - Database instance
 * @param {Object} document - The parent document object containing $index configuration
 * @param {string} basePath - Base path for resolving the index JSON file
 * @param {class} ModelClass - The class to instantiate for each row (should extend HydratedModel)
 * @param {Object} [options] - Additional options passed to the model constructor (e.g., { locale })
 * @returns {Object} { items, isLoading, error }
 */
export function useDocumentIndex(db, document, basePath, ModelClass, options = {}) {
	const [items, setItems] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!db || !document || !ModelClass) return

		setIsLoading(true)
		setError(null)

		const indexName = document.$index?.name || 'data'
		const fetchPath = `${basePath}/${indexName}.json`.replace(/^\//, '')

		db.fetch(fetchPath)
			.then((data) => {
				if (data) {
					const rawItems = Array.isArray(data) ? data : data.children || []
					
					const hydrated = rawItems.map((raw) => {
						return new ModelClass(raw, { ...options, parent: document })
					})

					hydrated.sort((a, b) => (a.order || 99) - (b.order || 99))
					setItems(hydrated)
				} else {
					setItems([])
				}
			})
			.catch((e) => {
				console.error('[useDocumentIndex]', e)
				setError(e)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [db, document, basePath, ModelClass])

	return { items, isLoading, error }
}

export default useDocumentIndex
