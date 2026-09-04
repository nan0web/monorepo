/**
 * Hierarchical fetch layer for the database.
 * Handles fetch, _fetchPrimary, fetchMerged, getInheritance, resolveReferences.
 * Extends DBDir to add hierarchical data fetching with inheritance, globals, and references.
 *
 * @class
 * @extends {DBDir}
 */
export default class DBFetch extends DBDir {
    /**
     * Returns a ReadableStream for the document at the given URI.
     * Base implementation wraps fetch() into a single-chunk stream.
     * FS/network drivers can override for true chunked streaming.
     * @param {string} uri - Document URI
     * @param {object | FetchOptions} [input] - Fetch options
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {ReadableStream}
     */
    fetchStream(uri: string, input?: object | FetchOptions, context?: AuthContext | object): ReadableStream;
    /**
     * Fetch document with inheritance, globals and references processing.
     * Handles extension lookup, directory resolution, and merging.
     * @param {string} uri
     * @param {object | FetchOptions} [input]
     * @param {AuthContext | object | Set<string>} [contextOrVisited=this.context] - Auth context or visited set
     * @param {Set<string>} [visited] - Set of visited URIs for circular reference detection
     * @returns {Promise<any>}
     */
    fetch(uri: string, input?: object | FetchOptions, contextOrVisited?: AuthContext | object | Set<string>, visited?: Set<string>): Promise<any>;
    /**
     * Primary fetch logic — extracted for fallback chain support.
     * @param {string} uri
     * @param {object | FetchOptions} [input]
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<any>}
     */
    _fetchPrimary(uri: string, input?: object | FetchOptions, context?: AuthContext | object, visited?: Set<any>): Promise<any>;
    /**
     * Merges data from multiple sources following nano-db-fetch patterns.
     * Handles inheritance, globals, and references with circular protection.
     * @param {string} uri - The URI to fetch and merge data for
     * @param {FetchOptions} [opts] - Fetch options
     * @param {AuthContext | Set<string>} [contextOrVisited] - Auth context or visited set
     * @param {Set<string>} [visited=new Set()] - For internal circular reference protection
     * @returns {Promise<any>} Merged data object
     */
    fetchMerged(uri: string, opts?: FetchOptions, contextOrVisited?: AuthContext | Set<string>, visited?: Set<string>): Promise<any>;
    _hasReference(data: any): boolean;
    _findReferenceKeys(flat: any): any;
    _getParentReferenceKey(key: any): any;
    /**
     * Handles document references and resolves them recursively with circular reference protection.
     * Supports fragment references (e.g., #prop/subprop) and merges siblings.
     * @param {object} data - Document data with potential references
     * @param {string} [basePath] - Base path for resolving relative references
     * @param {object|FetchOptions} [opts] - Options that will be passed to fetch
     * @param {Set<string>} [visited] - Set of visited URIs to prevent circular references
     * @returns {Promise<object>} Data with resolved references
     */
    resolveReferences(data: object, basePath?: string, opts?: object | FetchOptions, visited?: Set<string>): Promise<object>;
}
import DBDir from './DBDir.js';
import FetchOptions from '../FetchOptions.js';
import AuthContext from '../AuthContext.js';
