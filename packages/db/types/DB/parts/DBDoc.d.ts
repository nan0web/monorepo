/**
 * Document read/write layer for the database.
 * Handles loading, saving, deleting, and streaming documents with caching.
 * Extends DBAccess to add document-level operations.
 *
 * @class
 * @extends {DBAccess}
 */
export default class DBDoc extends DBAccess {
    /**
     * Gets document content from cache or loads if missing.
     * Supports default fallback value for missing documents.
     * @param {string} uri - Document URI
     * @param {object | any} [input] - Options or GetOptions instance
     * @param {AuthContext | object} [context] - Auth context
     * @returns {Promise<any>} Document content
     */
    get(uri: string, input?: object | any, context?: AuthContext | object): Promise<any>;
    /**
     * Parallel batch get — fetches multiple URIs concurrently.
     * @param {string[]} uris - Array of document URIs
     * @param {object | any} [input] - Options passed to each get()
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<Map<string, any>>} Map of URI → content
     */
    getAll(uris: string[], input?: object | any, context?: AuthContext | object): Promise<Map<string, any>>;
    /**
     * Sets document content in cache and updates metadata timestamp.
     * @param {string} uri - Document URI
     * @param {any} data - Document data
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<any>} The set data
     */
    set(uri: string, data: any, context?: AuthContext | object): Promise<any>;
    /**
     * Batch set — writes multiple entries with a single-pass index update.
     * @param {Array<[string, any]>} entries - Array of [uri, data] pairs
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<Map<string, any>>} Map of URI → written data
     */
    setAll(entries: Array<[string, any]>, context?: AuthContext | object): Promise<Map<string, any>>;
    /**
     * Gets document statistics from cache or loads if missing.
     * Supports extension fallback for extension-less URIs.
     * @param {string} uri - Document URI
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<DocumentStat | undefined>}
     */
    stat(uri: string, context?: AuthContext | object): Promise<DocumentStat | undefined>;
    /**
     * Moves a document from one URI to another URI
     * Loads source, saves to target, drops source, updates indexes.
     * @param {string} from - Source URI
     * @param {string} to - Target URI
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<boolean>} Success status
     */
    moveDocument(from: string, to: string, context?: AuthContext | object): Promise<boolean>;
    /**
     * Loads a document.
     * Must be overwritten to have the proper file or database document read operation.
     * In a basic class it just loads already saved data in the db.data map.
     * Supports extension fallback for extension-less URIs.
     * @param {string} uri - Document URI
     * @param {any} [defaultValue] - Default value if document not found
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<any>}
     */
    loadDocument(uri: string, defaultValue?: any, context?: AuthContext | object): Promise<any>;
    /**
     * Loads a document using a specific extension handler.
     * Implements in-memory caching via this.data Map.
     * @param {string} ext The extension of the document.
     * @param {string} uri The URI to load the document from.
     * @param {any} defaultValue The default value to return if the document does not exist.
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<any>} The loaded document or the default value.
     */
    loadDocumentAs(ext: string, uri: string, defaultValue: any, context?: AuthContext | object): Promise<any>;
    /**
     * Returns a read stream of the document.
     * @param {string} uri - Document URI
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<any>}
     */
    stream(uri: string, context?: AuthContext | object): Promise<any>;
    /**
     * Saves raw file content directly without parsing or serialization.
     * @param {string} uri - Document URI
     * @param {string|Buffer} content - Raw content to write
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<boolean>}
     */
    saveFile(uri: string, content: string | Buffer, context?: AuthContext | object): Promise<boolean>;
    /**
     * Save the document.
     * Implements in-memory caching: updates this.data with both normalized URI and absolute path.
     * Invalidates directory cache on save.
     * @param {string} uri - Document URI
     * @param {any} document - Document to save
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<boolean>}
     */
    saveDocument(uri: string, document: any, context?: AuthContext | object): Promise<boolean>;
    /**
     * Reads statistics for a specific document.
     * Must be overwritten to have the proper file or database document stat operation.
     * In a basic class it just returns a document stat from the db.meta map if exists.
     * @note Must be overwritten by platform-specific implementation
     * @param {string} uri - Document URI
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<DocumentStat>}
     */
    statDocument(uri: string, context?: AuthContext | object): Promise<DocumentStat>;
    /**
     * Writes data to a document with overwrite
     * @param {string} uri - Document URI
     * @param {string} chunk - Data to write
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<boolean>} Success status
     */
    writeDocument(uri: string, chunk: string, context?: AuthContext | object): Promise<boolean>;
    /**
     * Delete document from storage.
     * Invalidates both data and directory caches for the deleted URI.
     * @param {string} uri - Document URI
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<boolean>} TRUE if success, FALSE if fail
     */
    dropDocument(uri: string, context?: AuthContext | object): Promise<boolean>;
}
import DBAccess from './DBAccess.js';
import AuthContext from '../AuthContext.js';
import DocumentStat from '../../DocumentStat.js';
