/**
 * KBHashStore - Manages hashes for LLiMo Knowledge Base incremental updates.
 * Using @nan0web/db for internal persistence.
 */
export class KBHashStore {
    /**
     * Computes a deterministic aggregate hash for a list of files.
     *
     * @param {string[]} files List of file paths
     * @returns {string} SHA-256 hex string
     */
    compute(files: string[]): string;
    /**
     * Reads the stored hash for a given directory using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} dir Root directory of the package/project
     * @returns {Promise<string | null>}
     */
    read(db: import("@nan0web/db").DB, dir: string): Promise<string | null>;
    /**
     * Writes the hash to the directory's dataset store using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} dir Root directory
     * @param {string} hash Hash string
     * @returns {Promise<void>}
     */
    write(db: import("@nan0web/db").DB, dir: string, hash: string): Promise<void>;
    /**
     * Checks if the index in the given directory is stale compared to its current files.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} dir
     * @param {string[]} currentFiles
     * @returns {Promise<boolean>}
     */
    isStale(db: import("@nan0web/db").DB, dir: string, currentFiles: string[]): Promise<boolean>;
}
