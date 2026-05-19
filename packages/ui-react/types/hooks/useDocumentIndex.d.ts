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
export function useDocumentIndex(db: import("@nan0web/db-browser").default, document: any, basePath: string, ModelClass: class, options?: any): any;
export default useDocumentIndex;
