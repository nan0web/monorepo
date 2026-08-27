import { Buffer } from 'node:buffer';
import ResponseMessage from '../messages/ResponseMessage.js';
export type FetchOptions = {
    /**
     * - The HTTP method
     */
    method?: string;
    /**
     * - The request headers
     */
    headers?: Record<string, string | string[] | undefined>;
    /**
     * - The request body
     */
    body?: Buffer | ReadableStream | any;
    /**
     * - The response type
     */
    type?: string;
    /**
     * - The protocol to use (http, https, http2)
     */
    protocol?: string;
    /**
     * - The ALPNProtocols.
     */
    ALPNProtocols?: string[];
    /**
     * - The timeout in milliseconds
     */
    timeout?: number;
    /**
     * - Reject self-signed certificates
     */
    rejectUnauthorized?: boolean;
    /**
     * - The logger to use
     */
    logger?: Console;
    /**
     * - Abort signal.
     */
    signal?: AbortSignal;
};
/**
 * @typedef {Object} FetchOptions
 * @property {string} [options.method] - The HTTP method
 * @property {Record<string, string|string[]|undefined>} [options.headers] - The request headers
 * @property {Buffer|ReadableStream|Object} [options.body] - The request body
 * @property {string} [options.type] - The response type
 * @property {string} [options.protocol] - The protocol to use (http, https, http2)
 * @property {string[]} [options.ALPNProtocols] - The ALPNProtocols.
 * @property {number} [options.timeout] - The timeout in milliseconds
 * @property {boolean} [options.rejectUnauthorized] - Reject self-signed certificates
 * @property {Console} [options.logger] - The logger to use
 * @property {AbortSignal} [options.signal] - Abort signal.
 */
/**
 * Core fetch function
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function fetch(url: string, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes a GET request
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function get(url: string, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes a POST request
 * @param {string} url - The URL to fetch
 * @param {Object|Buffer|ReadableStream} body - The request body
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function post(url: string, body: any | Buffer | ReadableStream, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes a PUT request
 * @param {string} url - The URL to fetch
 * @param {Object|Buffer|ReadableStream} body - The request body
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function put(url: string, body: any | Buffer | ReadableStream, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes a PATCH request
 * @param {string} url - The URL to fetch
 * @param {Object|Buffer|ReadableStream} body - The request body
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function patch(url: string, body: any | Buffer | ReadableStream, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes a DELETE request
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function del(url: string, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes a HEAD request
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function head(url: string, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * Makes an OPTIONS request
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<ResponseMessage>} The response
 */
declare function options(url: string, options?: FetchOptions): Promise<ResponseMessage>;
/**
 * APIRequest class for handling API requests with default options
 * @class
 * @param {string} baseUrl - The base URL for API requests
 * @param {Object} defaultHeaders - Default headers for all requests
 * @param {Object} options - Additional options
 * @param {boolean} options.rejectUnauthorized - Reject self-signed certificates
 * @param {number} options.timeout - The timeout in milliseconds
 * @param {Object} options.logger - The logger to use
 */
declare class APIRequest {
    baseUrl: any;
    defaultHeaders: {};
    options: {
        rejectUnauthorized: any;
        timeout: any;
        ALPNProtocols: any;
    };
    logger: any;
    constructor(baseUrl: any, defaultHeaders?: {}, options?: {});
    /**
     * Constructs full URL from base and path
     * @param {string} path - The API endpoint path
     * @returns {string} The full URL
     */
    getFullUrl(path: string): string;
    /**
     * Makes a GET request
     * @param {string} path - The API endpoint path
     * @param {Object} headers - Additional headers
     * @returns {Promise<ResponseMessage>} The response
     */
    get(path: string, headers?: any): Promise<ResponseMessage>;
    /**
     * Makes a POST request
     * @param {string} path - The API endpoint path
     * @param {Object|Buffer|ReadableStream} body - The request body
     * @param {Object} headers - Additional headers
     * @returns {Promise<ResponseMessage>} The response
     */
    post(path: string, body: any | Buffer | ReadableStream, headers?: any): Promise<ResponseMessage>;
    /**
     * Makes a PUT request
     * @param {string} path - The API endpoint path
     * @param {Object|Buffer|ReadableStream} body - The request body
     * @param {Record<string, string>} headers - Additional headers
     * @returns {Promise<ResponseMessage>} The response
     */
    put(path: string, body: any | Buffer | ReadableStream, headers?: Record<string, string>): Promise<ResponseMessage>;
    /**
     * Makes a PATCH request
     * @param {string} path - The API endpoint path
     * @param {Object|Buffer|ReadableStream} body - The request body
     * @param {Record<string, string>} headers - Additional headers
     * @returns {Promise<ResponseMessage>} The response
     */
    patch(path: string, body: any | Buffer | ReadableStream, headers?: Record<string, string>): Promise<ResponseMessage>;
    /**
     * Makes a DELETE request
     * @param {string} path - The API endpoint path
     * @param {Record<string, string>} headers - Additional headers
     * @returns {Promise<ResponseMessage>} The response
     */
    del(path: string, headers?: Record<string, string>): Promise<ResponseMessage>;
}
export default fetch;
export { APIRequest, get, post, put, patch, del, head, options };
