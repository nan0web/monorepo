import { Document } from '@nan0web/ui'

/**
 * Normalizes a URI for document fetching from DBFS.
 * Delegates to core Document.normalizeUrl domain model method.
 * 
 * @param {string} uri - The URI to normalize.
 * @param {import('@nan0web/db').DB} [db] - Optional DB instance.
 * @returns {string} The normalized URL suitable for `db.fetch()`.
 */
export function normalizeDocumentUrl(uri, db) {
	return Document.normalizeUrl(uri, db)
}
