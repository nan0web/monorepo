/**
 * Universal editor model that works across frameworks.
 * Handles document logic: state, schema validation, and persistence orchestration.
 *
 * @class EditorModel
 * @property {DB} db - Database instance
 * @property {any} content - Current document content
 * @property {string} mode - Current mode ('code' or 'visual')
 */
export default class EditorModel {
    /**
     * @param {object} input
     * @param {DB} input.db
     * @param {string} [input.uri]
     * @param {any} [input.initialContent=null]
     * @param {string} [input.mode='code']
     */
    constructor({ db, uri, initialContent, mode }: {
        db: DB;
        uri?: string | undefined;
        initialContent?: any;
        mode?: string | undefined;
    });
    db: import("@nan0web/db").default;
    persistence: PersistenceManager;
    content: any;
    mode: string;
    uri: string | undefined;
    /**
     * Load document from DB
     * @param {string} [uri] - Optional URI override
     */
    loadDocument(uri?: string): Promise<any>;
    /**
     * Save document using PersistenceManager
     * @param {object} [options] - Save options
     */
    save(options?: object): Promise<{
        cache: any;
        commit: any;
        git: any;
    }>;
    /**
     * Update content locally
     * @param {any} newContent
     */
    updateContent(newContent: any): void;
    /**
     * Switch between modes
     * @param {string} mode
     */
    switchMode(mode: string): void;
    /**
     * Subscribe to changes
     * @param {Function} fn
     */
    onChange(fn: Function): () => boolean;
    #private;
}
export type DB = import("@nan0web/db").default;
import PersistenceManager from './PersistenceManager.js';
