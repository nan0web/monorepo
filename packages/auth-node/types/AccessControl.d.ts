/**
 * Server-side AccessControl with AuthDB I/O.
 * Reads .access, .group, access.txt files from disk via AuthDB.
 * Delegates parsing and matching to @nan0web/auth-core/AccessControl.
 */
export default class AccessControl {
    static ANY: string;
    static READ: string;
    static WRITE: string;
    static DELETE: string;
    static USER_ACCESS_FILE: string;
    static GROUP_ACCESS_FILE: string;
    static GLOBAL_ACCESS_FILE: string;
    /**
     * @param {import('./AuthDB').default} db
     */
    constructor(db: import("./AuthDB").default);
    db: import("@nan0web/db").default;
    /**
     * Checks access permissions for a user on a specific path and access level.
     * Reads rules from AuthDB on each call (lazy I/O).
     *
     * @param {string} username - Username to check access for
     * @param {string} path - Resource path to check access on
     * @param {string} [level='r'] - Access level: 'r' (read), 'w' (write), 'd' (delete)
     * @returns {Promise<boolean>} - True if access is granted, false otherwise
     */
    check(username: string, path: string, level?: string): Promise<boolean>;
    /**
     * Ensures access permissions are granted. Throws error if access is denied.
     *
     * @param {string} username - Username to check access for
     * @param {string} path - Resource path to check access on
     * @param {string} [level='r'] - Access level: 'r' (read), 'w' (write), 'd' (delete)
     * @returns {Promise<void>}
     * @throws {Error} - If access is denied
     */
    ensureAccess(username: string, path: string, level?: string): Promise<void>;
    /**
     * Get access summary for a user: their rules and groups.
     *
     * @param {string} username - Target username
     * @returns {Promise<{rules: Array<{subject: string, access: string, target: string}>, groups: Array<string>}>}
     */
    info(username: string): Promise<{
        rules: Array<{
            subject: string;
            access: string;
            target: string;
        }>;
        groups: Array<string>;
    }>;
    /**
     * Filter navigation items by user access.
     *
     * @param {Array<{path: string, guest?: boolean}>} navItems
     * @param {string|null} username - null = guest
     * @returns {Promise<Array<{path: string, guest?: boolean}>>}
     */
    filterNav(navItems: Array<{
        path: string;
        guest?: boolean;
    }>, username: string | null): Promise<Array<{
        path: string;
        guest?: boolean;
    }>>;
    /**
     * Load a CoreAccessControl with rules from AuthDB.
     * Reads .access, .group, and user-specific access.txt.
     *
     * @param {string|null} username
     * @returns {Promise<CoreAccessControl>}
     * @private
     */
    private _loadCore;
    /**
     * Read user-specific access.txt from AuthDB user directory.
     *
     * @param {string} username
     * @returns {Promise<string>}
     * @private
     */
    private _getUserAccessContent;
    /**
     * Reads a file from AuthDB, returns empty string on error.
     *
     * @param {string} path
     * @returns {Promise<string>}
     * @private
     */
    private _readFile;
}
