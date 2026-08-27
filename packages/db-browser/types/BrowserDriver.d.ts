import { DBDriverProtocol, DocumentStat } from '@nan0web/db';
export default class BrowserDriver extends DBDriverProtocol {
    db: IDBDatabase | null;
    connected: boolean;
    _cache: Map<any, any>;
    _metaCache: Map<any, any>;
    static DB_NAME: string;
    static STORE_NAME: string;
    static CACHE_STORE: string;
    constructor(input?: {});
    /** @returns {string} */
    get DB_NAME(): string;
    /** @returns {string} */
    get STORE_NAME(): string;
    /** @returns {string} */
    get CACHE_STORE(): string;
    /**
     * Connects to IndexedDB.
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Disconnects from IndexedDB and clears caches.
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * @param {'readonly'|'readwrite'} [mode='readonly']
     * @returns {IDBObjectStore}
     */
    _getStore(mode?: 'readonly' | 'readwrite'): IDBObjectStore;
    /**
     * @param {'readonly'|'readwrite'} [mode='readonly']
     * @returns {IDBObjectStore}
     */
    _getCacheStore(mode?: 'readonly' | 'readwrite'): IDBObjectStore;
    /**
     * Reads a document from the store (with in‑memory cache fallback).
     * @param {string} uri
     * @returns {Promise<any>}
     */
    read(uri: string): Promise<any>;
    /**
     * Writes a document to the store.
     * @param {string} uri
     * @param {any} document
     * @returns {Promise<boolean>}
     */
    write(uri: string, document: any): Promise<boolean>;
    /**
     * Appends (concatenates) a chunk to an existing document.
     * @param {string} uri
     * @param {string} chunk
     * @returns {Promise<boolean>}
     */
    append(uri: string, chunk: string): Promise<boolean>;
    /**
     * @param {string} uri
     * @returns {Promise<DocumentStat>}
     */
    stat(uri: string): Promise<DocumentStat>;
    /**
     * Deletes a document from the store.
     * @param {string} uri
     * @returns {Promise<boolean>}
     */
    delete(uri: string): Promise<boolean>;
    /**
     * Lists child URIs under a directory.
     *
     * The base `DBDriverProtocol` expects `listDir` to return an array of string URIs.
     * We therefore return just the absolute keys that start with the given `uri`.
     *
     * @param {string} uri
     * @returns {Promise<string[]>}
     */
    listDir(uri: string): Promise<string[]>;
}
