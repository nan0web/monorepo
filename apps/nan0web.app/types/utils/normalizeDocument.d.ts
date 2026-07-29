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
export function normalizeDocument(doc: any): object;
