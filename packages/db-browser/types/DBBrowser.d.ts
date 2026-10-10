/**
 * DBBrowser – minimal, test‑focused implementation.
 *
 * Core design:
 * • Direct `fetch` returns `json()` when possible, otherwise falls back to `text()`.
 * • `fetchRemote` removes host for `mockFetch`, handles retries.
 * • `statDocument` ignores any cache (super.statDocument) to ensure `isFile` is set.
 */
export default class DBBrowser extends DB {
    static Directory: typeof BrowserDirectory;
    /** @type {Function | null} */
    static "__#private@#FetchFn": Function | null;
    /** @type {Function} */
    static get FetchFn(): Function;
    /**
     * Computes a deterministic Base36 bucket and safe disk segment for a logical path segment.
     * If the segment contains a colon (like W3C DIDs 'did:nano:...'), it maps ':' -> '~'
     * and prefixes with a 2-character Base36 hash (giving 1,296 buckets).
     *
     * @param {string} segment Logical path segment
     * @returns {string} Physical path segment (e.g. '4f/did~nano~student1' or 'regular')
     */
    static resolveShardedSegment(segment: string): string;
    /**
     * Unshards a sanitized disk segment back to its logical name if it was sharded.
     * @param {string} segment
     * @returns {string}
     */
    static unshardSegment(segment: string): string;
    /**
     * Static from helper.
     * @param {any} input
     * @returns {DBBrowser}
     */
    static from(input: any): DBBrowser;
    /**
     * @param {object} [input]
     * @param {string} [input.host] - window.location.origin
     * @param {string} [input.indexFile='index.json']
     * @param {string} [input.localIndexFile='index.d.json']
     * @param {number} [input.timeout=6_000] - Request timeout in milliseconds
     * @param {Function} [input.fetchFn=DBBrowser.FetchFn] - Custom fetch function
     * @param {string} [input.root] - Base href (root) for the current DB
     * @param {Console | NoConsole} [input.console] - The console for messages
     */
    constructor(input?: {
        host?: string | undefined;
        indexFile?: string | undefined;
        localIndexFile?: string | undefined;
        timeout?: number | undefined;
        fetchFn?: Function | undefined;
        root?: string | undefined;
        console?: Console | NoConsole | undefined;
    });
    /**
     * Resolves sharded segment via instance method.
     * @param {string} segment
     * @returns {string}
     */
    resolveShardedSegment(segment: string): string;
    /**
     * Transforms a logical URI by applying Base36 sharding to any segments containing ':'.
     * @param {string} uri
     * @returns {string}
     */
    shardUri(uri: string): string;
    /** @type {string} */
    host: string;
    /** @type {number} */
    timeout: number;
    /** @type {Function} */
    fetchFn: Function;
    store: BrowserStore;
    /**
     * Validates access level.
     * @param {string} uri
     * @param {string} [level='r']
     * @returns {Promise<void>}
     */
    ensureAccess(uri: string, level?: string): Promise<void>;
    /**
     * Performs fetch with timeout and fallback.
     *
     * Adjusts URL for `mockFetch` which expects path‑only.
     *
     * @param {string} uri
     * @param {object} [requestInit={}]
     * @param {Set<string>} [visited=new Set()] recursion guard
     * @returns {Promise<Response>}
     */
    fetchRemote(uri: string, requestInit?: object, visited?: Set<string>): Promise<Response>;
    /**
     * Throws formatted HTTPError.
     * @param {Response} response
     * @param {string} message
     * @throws {HTTPError}
     */
    throwError(response: Response, message: string): Promise<void>;
    /**
     * Always performs HEAD request and returns `isFile: true`.
     *
     * Ignores any cache (super.statDocument) to ensure `isFile` is set.
     *
     * @param {string} uri
     * @returns {Promise<DocumentStat>}
     */
    statDocument(uri: string): Promise<DocumentStat>;
    /**
     * Determines file extension based on data type and structure.
     *
     * - URI with existing extension returns as is
     * - Array with nested objects -> .jsonl
     * - Array with flat primitive values -> .csv
     * - Object -> .json
     * - string -> .txt
     * - fallback / empty Array -> .json
     *
     * @param {string} uri
     * @param {any} document
     * @returns {string}
     */
    determineExtension(uri: string, document: any): string;
    /**
     * Internal parser for raw text based on extension or content-type.
     * @private
     */
    private _parseDocumentText;
    /**
     * Internal serializer for document based on extension.
     * @private
     */
    private _serializeDocument;
    /**
     * Loads and parses document, returns `defaultValue` on fail.
     * @param {string} uri
     * @param {any} [defaultValue]
     * @returns {Promise<any>}
     */
    loadDocument(uri: string, defaultValue?: any): Promise<any>;
    /**
     * Saves via POST.
     * @param {string} uri
     * @param {any} document
     * @returns {Promise<any>}
     */
    saveDocument(uri: string, document: any, context?: import("@nan0web/db").AuthContext): Promise<any>;
    /**
     * Updates via PUT.
     * @param {string} uri
     * @param {any} document
     * @returns {Promise<any>}
     */
    writeDocument(uri: string, document: any, context?: import("@nan0web/db").AuthContext): Promise<any>;
    /**
     * Deletes via DELETE.
     * @param {string} uri
     * @returns {Promise<boolean>}
     */
    dropDocument(uri: string): Promise<boolean>;
    /**
     * Synchronizes offline changes with the server.
     * @returns {Promise<number>} Number of synchronized documents
     */
    sync(): Promise<number>;
    /**
     * Creates DB subset.
     *
     * The original DBBrowser stores `root` with a leading slash (e.g. "/data/").
     * For the README‑based example we need a *relative* root without the leading slash,
     * and `cwd` must stay as the original host URL.
     *
     * @param {string} uri
     * @returns {DBBrowser}
     */
    extract(uri: string): DBBrowser;
}
import DB from '@nan0web/db';
import BrowserStore from './BrowserStore.js';
import { DocumentStat } from '@nan0web/db';
import BrowserDirectory from './Directory.js';
import { NoConsole } from '@nan0web/log';
