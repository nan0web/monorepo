/**
 * KBSearcher - Performs cascading keyword search across local and external KB indices using @nan0web/db.
 */
export class KBSearcher {
    /**
     * Search for a query inside a specific index (dataset) using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} query The search text
     * @param {string} indexDir Directory where .datasets/chunks.json is located
     * @param {object} opts { limit, threshold }
     * @returns {Promise<any[]>} List of SearchHit
     */
    search(db: import("@nan0web/db").DB, query: string, indexDir: string, opts?: object): Promise<any[]>;
    /**
     * Resolves a package source to its index directory using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {string} source
     * @returns {Promise<string | null>}
     */
    resolvePackageIndex(db: import("@nan0web/db").DB, source: string): Promise<string | null>;
    /**
     * Lists other indexed local projects in the monorepo root using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @returns {Promise<string[]>} List of absolute paths
     */
    listLocalProjects(db: import("@nan0web/db").DB): Promise<string[]>;
    /**
     * Lists all indexed external packages in total using DB.
     *
     * @param {import('@nan0web/db').DB} db
     * @returns {Promise<string[]>} List of absolute paths
     */
    listExternalPackages(db: import("@nan0web/db").DB): Promise<string[]>;
    /**
     * Finds unindexed dependencies in a search hits list.
     *
     * @param {import('@nan0web/db').DB} db
     * @param {any[]} hits
     * @param {string} cwd
     * @returns {Promise<any[]>}
     */
    findUnindexedDependencies(db: import("@nan0web/db").DB, hits: any[], cwd: string): Promise<any[]>;
}
