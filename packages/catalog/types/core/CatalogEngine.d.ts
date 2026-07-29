/**
 * Universal Catalog Engine
 */
export class CatalogEngine {
    constructor(data?: any[], options?: {});
    rawData: any[];
    options: {};
    filters: any;
    /**
     * Filter data based on active category and tags
     * @param {string} categoryId
     * @param {Object} item
     */
    matchesCategory(categoryId: string, item: any): boolean;
    /**
     * Get filtered items
     * @param {string} activeCategory
     * @param {string} searchQuery
     */
    getItems(activeCategory?: string, searchQuery?: string): any[];
    /**
     * Group items by a key or tag
     * @param {string} tagPrefix
     */
    getGroups(tagPrefix: string): void;
}
