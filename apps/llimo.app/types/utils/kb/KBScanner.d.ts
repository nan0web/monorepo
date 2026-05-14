/**
 * KBScanner - Scans directories and detects project registries using @nan0web/db.
 */
export class KBScanner {
    /**
     * Scans a directory for indexable files using DB traversal.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} dir Root directory to scan
     * @param {object} priorities { high: string[], low: string[] } extensions
     * @param {string[]} ignore Glob patterns to ignore
     * @returns {Promise<string[]>} List of RELATIVE file paths
     */
    scan(db: import("@nan0web/db").DB, dir: string, priorities: object, ignore: string[]): Promise<string[]>;
    /**
     * Detects which registries are used in a directory using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} dir Root directory
     * @param {Record<string, string>} dependencyFiles Mapping of registry -> file
     * @returns {Promise<string[]>} List of detected registry keys
     */
    detectRegistries(db: import("@nan0web/db").DB, dir: string, dependencyFiles: Record<string, string>): Promise<string[]>;
}
