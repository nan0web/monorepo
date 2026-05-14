/**
 * KBIndexer - Processes files into searchable datasets using @nan0web/db.
 */
export class KBIndexer {
    /**
     * Builds a searchable dataset from a list of files using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string[]} files List of file paths
     * @param {string} outputDir Path to .datasets directory
     * @returns {Promise<{ filesIndexed: number, chunksCreated: number }>}
     */
    build(db: import("@nan0web/db").DB, files: string[], outputDir: string): Promise<{
        filesIndexed: number;
        chunksCreated: number;
    }>;
    /**
     * Downloads a package from a specific registry into a target directory.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} registry 'npm', 'pip', etc.
     * @param {string} name Package name
     * @param {string} targetDir
     * @returns {Promise<void>}
     */
    downloadPackage(db: import("@nan0web/db").DB, registry: string, name: string, targetDir: string): Promise<void>;
    /**
     * Force reindexes a directory.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} dir
     */
    reindex(db: import("@nan0web/db").DB, dir: string): Promise<void>;
    #private;
}
