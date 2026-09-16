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
     * @returns {Promise<DocumentStat>} The document stat.
     */
    statDocument(uri: string): Promise<DocumentStat>;
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
     * @returns {Promise<any>} The loaded document or the default value.
     */
    loadDocumentAs(ext: string, uri: string, defaultValue?: any): Promise<any>;
    /**
     * Saves a document to the given URI, forcing a specific extension / format wrapper.
     * @throws {Error} If the document cannot be saved.
     * @param {string} ext The extension/format of the document (e.g. '.txt').
     * @param {string} uri The URI to save the document to.
     * @param {any} document The document to save.
     * @returns {Promise<boolean>} True if saved successfully, false otherwise.
     */
    saveDocumentAs(ext: string, uri: string, document: any): Promise<boolean>;
    /**
     * Saves raw file content directly to disk without registry savers/formatters.
     * @param {string} uri The URI to save the file to.
     * @param {string|Buffer} content The raw content to save.
     * @returns {Promise<boolean>} True if saved successfully, false otherwise.
     */
    saveFile(uri: string, content: string | Buffer): Promise<boolean>;
    /**
     * Saves a document to the given URI.
     * @throws {Error} If the document cannot be saved.
     * @param {string} uri The URI to save the document to.
     * @param {any} document The document to save.
     * @returns {Promise<boolean>} True if saved successfully, false otherwise.
     */
    saveDocument(uri: string, document: any): Promise<boolean>;
    /**
     * Appends a chunk of data to a document at the given URI.
     * @throws {Error} If the document cannot be written.
     * @param {string} uri The URI to write the document to.
     * @param {string} chunk The chunk to write.
     * @returns {Promise<boolean>} True if written successfully, false otherwise.
     */
    writeDocument(uri: string, chunk: string): Promise<boolean>;
    /**
     * Creates a read stream for a document at the given URI.
     * @throws {Error} If the document cannot be read.
     * @param {string} uri The URI to read from.
     * @returns {Promise<any>} An asynchronous iterator or stream.
     */
    stream(uri: string): Promise<any>;
    /**
     * Deletes a document at the given URI.
     * @throws {Error} If the document cannot be dropped.
     * @param {string} uri The URI(s) of the document(s) to drop.
     * @param {object} [options={}]
     * @param {boolean} [options.recursive=false]
     * @returns {Promise<boolean>} True if dropped successfully, false otherwise.
     */
    dropDocument(uri: string, options?: {
        recursive?: boolean | undefined;
    }): Promise<boolean>;
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
