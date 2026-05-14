import { createContext, useContext, useMemo, useState } from 'react'
import { CatalogEngine } from '../core/CatalogEngine.js'

const CatalogContext = createContext(null)

/**
 * Catalog Provider
 */
export function CatalogProvider({ data, children, initialCategory = 'all' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')

  const engine = useMemo(() => new CatalogEngine(data), [data])

  const filteredItems = useMemo(() => {
    return engine.getItems(activeCategory, searchQuery)
  }, [engine, activeCategory, searchQuery])

  const value = {
    items: filteredItems,
    allItems: data,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    count: filteredItems.length
  }

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  )
}

/**
 * Hook to use Catalog
 */
export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}
