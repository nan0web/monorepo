import DB, { DocumentStat } from '@nan0web/db';
import { NoConsole } from '@nan0web/log';
import BrowserDirectory from './Directory.js';
import BrowserStore from './BrowserStore.js';
/**
 * DBBrowser – minimal, test‑focused implementation.
 *
 * Core design:
 * • Direct `fetch` returns `json()` when possible, otherwise falls back to `text()`.
 * • `fetchRemote` removes host for `mockFetch`, handles retries.
 * • `statDocument` ignores any cache (super.statDocument) to ensure `isFile` is set.
 */
export default class DBBrowser extends DB {
    #private;
    store: BrowserStore;
    static Directory: typeof BrowserDirectory;
    static FetchOptions: typeof import("@nan0web/db").FetchOptions;
    /** @type {Function} */
    static get FetchFn(): Function;
    /** @type {string} */
    host: string;
    /** @type {number} */
    timeout: number;
    /** @type {Function} */
    fetchFn: Function;
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
        host?: string;
        indexFile?: string;
        localIndexFile?: string;
        timeout?: number;
        fetchFn?: Function;
        root?: string;
        console?: Console | NoConsole;
    });
    /**
     * Resolves URI to virtual path or absolute URL.
     * @param  {...string} args
     * @returns {Promise<string>}
     */
    resolve(...args: string[]): Promise<string>;
    /**
     * Resolves path segments to absolute URL synchronously.
     * @param {...string} args
     * @returns {string}
     */
    resolveSync(...args: string[]): string;
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
    /**
     * Static from helper.
     * @param {any} input
     * @returns {DBBrowser}
     */
    static from(input: any): DBBrowser;
}
