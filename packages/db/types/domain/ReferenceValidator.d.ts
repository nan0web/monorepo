/**
 * Validates references ($ref, href, $href) within documents in the database.
 * Supports checking a single document or scanning the entire database.
 * Uses DB.resolveSync to normalize relative paths and DB.statDocument for existence checks.
 *
 * @class
 */
export default class ReferenceValidator {
    /**
     * Extracts all references from a data object by flattening it
     * and finding keys ending with reference attributes.
     *
     * @param {any} data - The data object to parse
     * @returns {Array<{path: string, ref: string}>} Array of extracted references
     */
    static extractReferences(data: any): Array<{
        path: string;
        ref: string;
    }>;
    /**
     * @param {import('../DB/DB.js').default} db - Database instance
     */
    constructor(db: import("../DB/DB.js").default);
    db: import("../index.js").DB;
    /**
     * Validates all references within a specific document.
     * Returns an array of broken references.
     *
     * @param {string} uri - The URI of the document to validate
     * @returns {Promise<Array<{path: string, ref: string, resolvedUri: string}>>} Array of broken references
     */
    validateDocument(uri: string): Promise<Array<{
        path: string;
        ref: string;
        resolvedUri: string;
    }>>;
    /**
     * Scans the database (or a specific directory) for all broken references.
     * Returns a map of document URIs to their broken references.
     *
     * @param {string} [dirPath='.'] - The directory to scan
     * @returns {Promise<Record<string, Array<{path: string, ref: string, resolvedUri: string}>>>}
     */
    validateAll(dirPath?: string): Promise<Record<string, Array<{
        path: string;
        ref: string;
        resolvedUri: string;
    }>>>;
}
