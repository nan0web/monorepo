/**
 * Universal Catalog Engine
 */
export class CatalogEngine {
  constructor(data = [], options = {}) {
    this.rawData = data
    this.options = options
    this.filters = options.filters || {}
  }

  /**
   * Filter data based on active category and tags
   * @param {string} categoryId
   * @param {Object} item
   */
  matchesCategory(categoryId, item) {
    if (!categoryId || categoryId === 'all') return true

    // Check type match (e.g. MasterCard, Visa)
    if (item.type?.toLowerCase() === categoryId.toLowerCase()) return true

    // Check tag match
    if (item.tags?.includes(categoryId)) return true

    return false
  }

  /**
   * Get filtered items
   * @param {string} activeCategory
   * @param {string} searchQuery
   */
  getItems(activeCategory = 'all', searchQuery = '') {
    return this.rawData.filter(item => {
      // 1. Category Filter
      const categoryMatch = this.matchesCategory(activeCategory, item)
      if (!categoryMatch) return false

      // 2. Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const textMatch = (item.name || '').toLowerCase().includes(query) ||
                          (item.description || '').toLowerCase().includes(query) ||
                          (item.tags || []).some(t => t.toLowerCase().includes(query))
        if (!textMatch) return false
      }

      return true
    })
  }

  /**
   * Group items by a key or tag
   * @param {string} tagPrefix
   */
  getGroups(tagPrefix) {
    // Logic for grouping (e.g. for optgroups)
    // To be implemented as needed
  }
}
