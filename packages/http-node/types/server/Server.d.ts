import { Server as HttpServer } from 'node:http';
import Router from './Router.js';
import IncomingMessage from '../messages/IncomingMessage.js';
import ServerResponse from '../messages/ServerResponse.js';
export type MiddlewareFn = (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => Promise<void>;
export type ServerOptions = {
    id?: string;
    middlewares?: Array<MiddlewareFn>;
    server?: HttpServer | null;
    port?: number;
    host?: string;
    logger?: Console;
    ssl?: any | undefined;
};
/** @typedef {(req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => Promise<void>} MiddlewareFn */
/**
 * @typedef {Object} ServerOptions
 * @property {string} [id='']
 * @property {Array<MiddlewareFn>} [middlewares=[]]
 * @property {HttpServer|null} [server=null]
 * @property {number} [port=0]
 * @property {string} [host="http://localhost"]
 * @property {Console} [logger=console]
 * @property {Object|undefined} [ssl]
 */
/**
 * HTTP Server class – minimal implementation focused on testability.
 * Routes are stored in a simple map per HTTP method, eliminating the need
 * for an external Router. This avoids the previous dead‑lock where
 * `router.handle` never resolved, causing request time‑outs.
 */
export default class Server {
    /** @type {string} */
    id: string;
    /** @type {Router} */
    router: Router;
    /** @type {Array<MiddlewareFn>} */
    middlewares: Array<MiddlewareFn>;
    /** @type {HttpServer|null} */
    server: HttpServer | null;
    /** @type {number} */
    port: number;
    /** @type {string} */
    host: string;
    /** @type {Console} */
    logger: Console;
    /** @type {Object|undefined} */
    ssl: any | undefined;
    /**
     * @param {ServerOptions} options
     */
    constructor(options?: ServerOptions);
    /** @param {MiddlewareFn} middleware */
    use(middleware: MiddlewareFn): this;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    get(path: string, handler: MiddlewareFn): Server;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    post(path: string, handler: MiddlewareFn): Server;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    put(path: string, handler: MiddlewareFn): Server;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    delete(path: string, handler: MiddlewareFn): Server;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    patch(path: string, handler: MiddlewareFn): Server;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    head(path: string, handler: MiddlewareFn): Server;
    /**
     * @param {string} path
     * @param {MiddlewareFn} handler
     * @returns {Server}
     */
    options(path: string, handler: MiddlewareFn): Server;
    listen(): Promise<any>;
    /**
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Main request entry point.
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void>;
    /**
     * Helper method to send JSON response
     * @param {ServerResponse} res
     * @param {any} data
     */
    sendJson(res: ServerResponse, data: any): void;
}
/**
 * Attach a debug header to every response.
 * @param {ServerResponse} res
 * @param {string} serverId
 */
export declare function setDebugHeader(res: ServerResponse, serverId: string): void;
/**
 * Pre‑set status for DELETE routes – must be done **before**
 * the handler calls `res.json`/`res.end`.
 * @param {import('../messages/IncomingMessage.js').default} req
 * @param {import('../messages/ServerResponse.js').default} res
 */
export declare function prepareDeleteResponse(req: import('../messages/IncomingMessage.js').default, res: import('../messages/ServerResponse.js').default): void;
/**
 * Run middlewares, then invoke the supplied final handler.
 * @param {import('../messages/IncomingMessage.js').default} req
 * @param {import('../messages/ServerResponse.js').default} res
 * @param {Array<MiddlewareFn>} middlewares
 * @param {Function} finalHandler
 */
export declare function runMiddlewares(req: import('../messages/IncomingMessage.js').default, res: import('../messages/ServerResponse.js').default, middlewares: Array<MiddlewareFn>, finalHandler: Function): Promise<void>;
/**
 * Generic error handling for request processing.
 * @param {any} err
 * @param {import('../messages/ServerResponse.js').default} res
 */
export declare function handleError(err: any, res: import('../messages/ServerResponse.js').default): Promise<void>;
