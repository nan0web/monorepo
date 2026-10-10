/**
 * Document operations layer for filesystem database.
 * Handles reading, saving, streaming, appending, and deleting documents.
 *
 * @class
 * @extends {DBFSPath}
 */
export default class DBFSDoc extends DBFSPath {
    /**
     * Ensures the current operation has proper access rights.
     * @param {string} uri The URI to check access for.
     * @param {"r"|"w"|"d"} [level="r"] The access level: read, write, or delete.
     * @returns {Promise<void>}
     */
    ensureAccess(uri: string, level?: "r" | "w" | "d"): Promise<void>;
    /**
     * Returns the stat of the document without meta (cache) check.
     * ```
     * NO ACCESS CHECK!
     * ```
     * @param {string} uri The URI to stat the document from.
     * @param {any} [context=this.context]
     * @returns {Promise<DocumentStat>} The document stat.
     */
    statDocument(uri: string, context?: any): Promise<DocumentStat>;
    /**
     * Ensures the directory path for a given URI exists, creating it if necessary.
     * @param {string} uri The URI to build the path for.
     * @returns {Promise<void>}
     */
    _buildPath(uri: string): Promise<void>;
    /**
     * Loads a document using a specific extension handler.
     * @param {string} ext The extension of the document.
     * @param {string} uri The URI to load the document from.
     * @param {any} defaultValue The default value to return if the document does not exist.
     * @param {any} [context=this.context]
     * @returns {Promise<any>} The loaded document or the default value.
     */
    loadDocumentAs(ext: string, uri: string, defaultValue?: any, context?: any): Promise<any>;
    /**
     * Saves a document to the given URI, forcing a specific extension / format wrapper.
     * @throws {Error} If the document cannot be saved.
     * @param {string} ext The extension/format of the document (e.g. '.txt').
     * @param {string} uri The URI to save the document to.
     * @param {any} document The document to save.
     * @param {any} [context=this.context]
     * @returns {Promise<boolean>} True if saved successfully, false otherwise.
     */
    saveDocumentAs(ext: string, uri: string, document: any, context?: any): Promise<boolean>;
    /**
     * Saves raw file content directly to disk without registry savers/formatters.
     * @param {string} uri The URI to save the file to.
     * @param {string|Buffer} content The raw content to save.
     * @param {any} [context=this.context]
     * @returns {Promise<boolean>} True if saved successfully, false otherwise.
     */
    saveFile(uri: string, content: string | Buffer, context?: any): Promise<boolean>;
    /**
     * Determines the target file extension when no extension is specified in URI.
     * Can be overridden or customized to change format priority.
     * Default priority:
     * - .nan0 if structured object with multiple fields
     * - .md with NaN0 frontmatter if content length exceeds other metadata
     * - .txt for raw strings
     *
     * @param {string} uri Document URI
     * @param {any} document Document content
     * @returns {string} Determined extension, e.g. '.nan0' or '.md'
     */
    determineExtension(uri: string, document: any): string;
    /**
     * Saves a document to the given URI.
     * @throws {Error} If the document cannot be saved.
     * @param {string} uri The URI to save the document to.
     * @param {any} document The document to save.
     * @param {any} [context=this.context]
     * @returns {Promise<boolean>} True if saved successfully, false otherwise.
     */
    saveDocument(uri: string, document: any, context?: any): Promise<boolean>;
    /**
     * Appends a chunk of data to a document at the given URI.
     * @throws {Error} If the document cannot be written.
     * @param {string} uri The URI to write the document to.
     * @param {string} chunk The chunk to write.
     * @param {any} [context=this.context]
     * @returns {Promise<boolean>} True if written successfully, false otherwise.
     */
    writeDocument(uri: string, chunk: string, context?: any): Promise<boolean>;
    /**
     * Creates a read stream for a document at the given URI.
     * @throws {Error} If the document cannot be read.
     * @param {string} uri The URI to read from.
     * @param {any} [context=this.context]
     * @returns {Promise<any>} An asynchronous iterator or stream.
     */
    stream(uri: string, context?: any): Promise<any>;
    /**
     * Deletes a document at the given URI.
     * @throws {Error} If the document cannot be dropped.
     * @param {string} uri The URI(s) of the document(s) to drop.
     * @param {object} [options={}]
     * @param {boolean} [options.recursive=false]
     * @param {any} [context=this.context]
     * @returns {Promise<boolean>} True if dropped successfully, false otherwise.
     */
    dropDocument(uri: string, options?: {
        recursive?: boolean | undefined;
    }, context?: any): Promise<boolean>;
    /**
     * Deletes a document or documents at the given URI(s).
     * @throws {Error} If the document cannot be dropped.
     * @param {string | string[]} uri The URI(s) of the document(s) to drop.
     * @returns {Promise<boolean | boolean[]>} True if dropped successfully, false otherwise.
     */
    drop(uri: string | string[]): Promise<boolean | boolean[]>;
}
import DBFSPath from './DBFSPath.js';
import { DocumentStat } from '@nan0web/db';
