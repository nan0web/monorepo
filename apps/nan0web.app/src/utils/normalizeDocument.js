/**
 * Normalizes document structure from DBFS to a standard format.
 *
 * Supports:
 * - Markdown documents (with .document field)
 * - NaN0/YAML/JSON documents (plain objects)
 * - Documents with $content (pre-parsed)
 *
 * @param {any} doc - Raw document from DBFS
 * @returns {object} Normalized document
 */
export function normalizeDocument(doc) {
	if (!doc || typeof doc !== 'object') {
		return { content: '', $content: [] }
	}

	// Case 1: Markdown document with .document field
	if (doc.document && Array.isArray(doc.document.children)) {
		return {
			// Extract metadata from vars (frontmatter)
			...doc.vars,
			// Content as Markdown string
			content: doc.toString(),
			// Pre-parsed structure for rendering
			$content: doc.document.children,
		}
	}

	// Case 2: Document with $content (already parsed)
	if (doc.$content && Array.isArray(doc.$content)) {
		return {
			...doc,
			content: doc.content || '', // Ensure content exists
		}
	}

	// Case 3: Plain object (NaN0/YAML/JSON)
	return {
		...doc,
		content: doc.content || '', // Ensure content exists
		$content: doc.$content || [], // Ensure $content exists
	}
}
