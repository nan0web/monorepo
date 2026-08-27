export type ServerRequest = import('@nan0web/http-node').IncomingMessage & {
    params: Record<string, string>;
    body?: any;
};
export type ServerResponse = import('node:http').ServerResponse & import('@nan0web/http-node').ServerResponse;
/**
 * @typedef {import('@nan0web/http-node').IncomingMessage & { params: Record<string, string>, body?: any }} ServerRequest
 * @typedef {import('node:http').ServerResponse & import('@nan0web/http-node').ServerResponse} ServerResponse
 */
/**
 * DBServer - wraps @nan0web/http-node/Server and mounts DB routes.
 *
 * @param {Object} [options]
 * @param {import('@nan0web/db').DB} options.db - database instance
 * @param {number} [options.port=3456] - listen port
 * @param {string} [options.host='0.0.0.0'] - listen host
 * @param {import('@nan0web/log').ConsoleLike} [options.logger=console] - logger
 */
export default class DBServer {
    #private;
    /** @type {import('@nan0web/http-node/server').Server} */
    server: import('@nan0web/http-node/server').Server;
    /** @type {import('@nan0web/db').DB} */
    db: import('@nan0web/db').DB;
    /** @type {number} */
    port: number;
    /** @type {string} */
    host: string;
    /** @type {import('@nan0web/log').ConsoleLike} */
    logger: import('@nan0web/log').ConsoleLike;
    /**
     * @param {{ db: import('@nan0web/db').DB, port?: number, host?: string, logger?: import('@nan0web/log').ConsoleLike }} input
     */
    constructor(input: {
        db: import('@nan0web/db').DB;
        port?: number;
        host?: string;
        logger?: import('@nan0web/log').ConsoleLike;
    });
    /**
     * Start listening.
     * @returns {Promise<DBServer>}
     */
    listen(): Promise<DBServer>;
    /**
     * Stop the server.
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Factory: create + start in one call.
     * @param {{ db: import('@nan0web/db').DB, port?: number, host?: string, logger?: import('@nan0web/log').ConsoleLike }} input
     * @returns {Promise<DBServer>}
     */
    static create(input: {
        db: import('@nan0web/db').DB;
        port?: number;
        host?: string;
        logger?: import('@nan0web/log').ConsoleLike;
    }): Promise<DBServer>;
}
