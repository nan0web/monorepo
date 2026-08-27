import { ServerResponse as HttpServerResponse } from 'node:http';
import IncomingMessage from './IncomingMessage.js';
/**
 * @extends {HttpServerResponse}
 */
export default class ServerResponse extends HttpServerResponse {
    /** @type {Object} */
    params: any;
    /**
     *
     * @param {IncomingMessage} [req]
     * @param {{ params?: object }} [options]
     */
    constructor(req?: IncomingMessage, options?: {
        params?: object;
    });
    /**
     * Set JSON response.
     * @param {any} data
     */
    json(data: any): void;
    /**
     * Override writeHead to correctly handle different signatures and set headers.
     *
     * Supported signatures:
     *   writeHead(statusCode, statusMessage, headers)
     *   writeHead(statusCode, headers)
     *   writeHead(statusCode, statusMessage)
     *
     * @param {number} statusCode
     * @param {string|object|Array} [statusMessageOrHeaders]
     * @param {object|Array} [headersOrCallback]
     */
    writeHead(statusCode: number, statusMessageOrHeaders?: string | object | any[], headersOrCallback?: object | any[]): this;
    /**
     * @param {any} [chunk]
     * @param {any} [encoding]
     * @param {any} [callback]
     */
    end(chunk?: any, encoding?: any, callback?: any): this;
}
