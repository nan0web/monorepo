/**
 * Normalizes a URI for document fetching from DBFS.
 * This logic handles:
 * - Empty/root URI to `index.json`
 * - Stripping `.html` extensions
 * - Appending a default extension if none is provided
 * - Removing leading slashes so DBFS resolves relative to its root
 * 
 * @param {string} uri - The URI to normalize.
 * @param {object} [db] - Optional DB instance providing directory format defaults.
 * @returns {string} The normalized URL suitable for `db.fetch()`.
 */
export function normalizeDocumentUrl(uri, db) {
	let url = uri || 'index.json'
	if (url === '/') url = 'index.json'

	// Strip .html extension for data fetching
	if (url.endsWith('.html')) {
		url = url.slice(0, -5)
	}

	if (!url.includes('.')) {
		// Use DB's configured default data extension (e.g. '.nan0', '.json')
		const ext = (db?.Directory?.DATA_EXTNAMES && db.Directory.DATA_EXTNAMES[0]) || '.json'
		url = (url.endsWith('/') ? url + 'index' : url) + ext
	}

	// Strip leading slash so DB resolves relative to its root (e.g. "data/")
	if (url.startsWith('/')) url = url.slice(1)

	return url
}
