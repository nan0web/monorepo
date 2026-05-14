/**
 * PersistenceManager.js - Orchestrates different data saving strategies.
 * Pure logic, no UI dependencies.
 */
export class PersistenceManager {
    /**
     * @param {object} config
     * @param {object} config.db - Database instance (@nan0web/db)
     */
    constructor({ db }: {
        db: object;
    });
    /**
     * Save data using active strategies
     * @param {string} uri - Document URI
     * @param {any} data - Content to save
     * @param {object} [options] - Save options (message, author, etc)
     */
    save(uri: string, data: any, options?: object): Promise<{
        cache: any;
        commit: any;
        git: any;
    }>;
    /**
     * Configure active strategies
     * @param {object} settings
     */
    configure(settings: object): void;
    #private;
}
export default PersistenceManager;
