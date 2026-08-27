import { AuthContext, DBDriverProtocol, DocumentStat } from '@nan0web/db';
/**
 * File System Driver for Node.js environments.
 * Provides persistent storage using fs/promises with automatic format handling.
 */
export default class FSDriver extends DBDriverProtocol {
    connected: boolean | undefined;
    constructor(config?: {});
    /**
     * Connects to the file system.
     * @returns {Promise<void>}
     * @throws {Error} - If root directory is inaccessible
     */
    connect(): Promise<void>;
    /**
     * Ensures access to the resource.
     * @param {string} absoluteURI - URI path
     * @param {'r'|'w'|'d'} [level="r"]
     * @param {AuthContext} [context=new AuthContext()]
     * @returns {Promise<boolean | void>} - TRUE if allowed, FALSE if denied, undefined if not realized.
     * @throws {Error} - Access denied (e.g., no write permission)
     */
    access(absoluteURI: string, level?: 'r' | 'w' | 'd', context?: AuthContext): Promise<boolean | void>;
    /**
     * Reads document from file with automatic format handling.
     * @param {string} absoluteURI - File URI
     * @param {any} [defaultValue] - Default if not found
     * @returns {Promise<any>}
     */
    read(absoluteURI: string, defaultValue?: any): Promise<any>;
    /**
     * Creates a read stream for a document.
     * @param {string} absoluteURI - File URI
     * @returns {Promise<any>}
     */
    stream(absoluteURI: string): Promise<any>;
    /**
     * Ensures directory exists.
     * @param {string} dirPath
     * @throws {Error}
     */
    ensureDir(dirPath: string): Promise<void>;
    /**
     * Writes document to file with automatic format handling.
     * @param {string} absoluteURI - File URI
     * @param {any} document - Document to write
     * @returns {Promise<boolean | void>} - TRUE on success, FALSE on failure, undefined if not realized.
     */
    write(absoluteURI: string, document: any): Promise<boolean | void>;
    /**
     * Appends data to a file.
     * @param {string} absoluteURI - File URI
     * @param {string} chunk - Data to append
     * @returns {Promise<boolean | void>} - TRUE on success, FALSE on failure, undefined if not realized.
     */
    append(absoluteURI: string, chunk: string): Promise<boolean | void>;
    /**
     * Deletes a file.
     * @param {string} absoluteURI - File URI
     * @returns {Promise<boolean | void>}
     */
    delete(absoluteURI: string): Promise<boolean | void>;
    /**
     * Gets file statistics.
     * @param {string} absoluteURI - File URI
     * @returns {Promise<DocumentStat>}
     */
    stat(absoluteURI: string): Promise<DocumentStat>;
    /**
     * Lists directory contents.
     * @param {string} absoluteURI - Directory URI
     * @returns {Promise<Array<string>>}
     */
    listDir(absoluteURI: string): Promise<Array<string>>;
    /**
     * @param {any} input
     * @returns {FSDriver}
     */
    static from(input: any): FSDriver;
}
