/**
 * Directory, indexing, and search layer for the database.
 * Handles listDir, readDir, browse, find, findStream, buildIndexes, getGlobals.
 * Extends DBDoc to add directory-level operations.
 *
 * @class
 * @extends {DBDoc}
 */
export default class DBDir extends DBDoc {
    /**
     * Lists directory contents at the given URI.
     * Implements _dirCache for positive and negative caching of directory listings.
     * @param {string} uri - Directory URI
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<DocumentEntry[]>} Array of document entries
     */
    listDir(uri: string, context?: AuthContext | object): Promise<DocumentEntry[]>;
    /**
     * Push stream of progress state
     * Traverses directory with sorting, limiting, and loading options.
     * Yields StreamEntry with cumulative stats and errors.
     * @param {string} uri - Starting URI
     * @param {object} [options] - Stream options
     * @param {AuthContext | object} [options.context] - Auth context
     * @param {Function} [options.filter] - Filter function
     * @param {number} [options.limit] - Limit number of entries
     * @param {'name'|'mtime'|'size'} [options.sort] - The sort criteria
     * @param {'asc'|'desc'} [options.order] - Sort order
     * @param {boolean} [options.skipStat] - Skip statistics
     * @param {boolean} [options.skipSymbolicLink] - Skip symbolic links
     * @param {boolean} [options.load=false] - Load data files into memory
     * @yields {StreamEntry} Progress state
     * @returns {AsyncGenerator<StreamEntry, void, unknown>}
     */
    findStream(uri: string, options?: {
        context?: AuthContext | object;
        filter?: Function | undefined;
        limit?: number | undefined;
        sort?: "name" | "mtime" | "size" | undefined;
        order?: "asc" | "desc" | undefined;
        skipStat?: boolean | undefined;
        skipSymbolicLink?: boolean | undefined;
        load?: boolean | undefined;
    }): AsyncGenerator<StreamEntry, void, unknown>;
    /**
     * Saves index data to both index.jsonl and index.txt files
     * @param {string} dirUri Directory URI where indexes should be saved
     * @param {Array<[string, DocumentStat]>} [entries] Document entries with their paths, if not provided this.meta is used.
     * @returns {Promise<void>}
     */
    saveIndex(dirUri: string, entries?: Array<[string, DocumentStat]>): Promise<void>;
    /**
     * Loads index data from either index.jsonl or index.txt file
     * @param {string} [dirUri] Directory URI where index file is located
     * @returns {Promise<DirectoryIndex>} Index data.
     */
    loadIndex(dirUri?: string): Promise<DirectoryIndex>;
    /**
     * Auto-updates index.jsonl and index.txt after document save for all parent directories
     * @param {string} uri - URI of saved document
     * @returns {Promise<void>}
     */
    _updateIndex(uri: string): Promise<void>;
    /**
     * Gets inheritance data for a given path
     * Loads and merges directory-level settings (e.g., _.json files) up the hierarchy.
     * Caches results to avoid redundant loads.
     * @param {string} path - Document path
     * @returns {Promise<any>} Inheritance data
     */
    getInheritance(path: string): Promise<any>;
    /**
     * Gets global variables for a given path.
     * Uses _dirCache to prevent redundant listDir calls.
     * @param {string} path - Document path
     * @returns {Promise<Record<string, any>>} Global variables
     */
    getGlobals(path: string): Promise<Record<string, any>>;
    /**
     * Browses files recursively like `ls -r`.
     * @param {string} [uri='.'] - Directory URI
     * @param {object} [options]
     * @param {number} [options.depth=-1] - Recursion depth (-1 unlimited)
     * @param {boolean} [options.includeDirs=false] - Include directories
     * @param {boolean} [options.skipIndex=false] - Skip index files
     * @param {string[]} [options.ignore=[]] - Patterns to ignore
     * @param {Function} [options.filter] - Custom filter function
     * @yields {DocumentEntry} File entries
     */
    browse(uri?: string, options?: {
        depth?: number | undefined;
        includeDirs?: boolean | undefined;
        skipIndex?: boolean | undefined;
        ignore?: string[] | undefined;
        filter?: Function | undefined;
    }): AsyncGenerator<DocumentEntry, void, unknown>;
}
import DBDoc from './DBDoc.js';
import AuthContext from '../AuthContext.js';
import DocumentEntry from '../../DocumentEntry.js';
import StreamEntry from '../../StreamEntry.js';
import DocumentStat from '../../DocumentStat.js';
import DirectoryIndex from '../../DirectoryIndex.js';
