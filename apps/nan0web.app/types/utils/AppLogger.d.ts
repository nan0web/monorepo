/**
 * AppLogger — File-based Access & Error Logger with rotation.
 *
 * Driven entirely by LogConfig (Model-as-Schema).
 * Supports daily, hourly, and size-based rotation strategies.
 *
 * Usage:
 *   const logger = new AppLogger(logConfig, cwd)
 *   logger.access({ method: 'GET', path: '/uk/catalog', status: 200, ms: 12 })
 *   logger.error({ message: 'DB timeout', stack: '...' })
 */
export default class AppLogger {
    /**
     * @param {import('../domain/LogConfig.js').default} config
     * @param {string} cwd
     */
    constructor(config: import("../domain/LogConfig.js").default, cwd?: string);
    /** @type {import('../domain/LogConfig.js').default} */
    config: import("../domain/LogConfig.js").default;
    /** @type {string} */
    baseDir: string;
    /** @type {fs.WriteStream | null} */
    _accessStream: fs.WriteStream | null;
    /** @type {fs.WriteStream | null} */
    _errorStream: fs.WriteStream | null;
    /**
     * Initialize log directory and open streams.
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
    /**
     * Log an access event (request/response).
     * @param {{ method?: string, path?: string, status?: number, ms?: number, locale?: string }} entry
     */
    access(entry: {
        method?: string;
        path?: string;
        status?: number;
        ms?: number;
        locale?: string;
    }): void;
    /**
     * Log an error event.
     * @param {{ message?: string, stack?: string, code?: string, path?: string }} entry
     */
    error(entry: {
        message?: string;
        stack?: string;
        code?: string;
        path?: string;
    }): void;
    /**
     * Close all streams gracefully.
     */
    close(): void;
    #private;
}
import fs from 'node:fs';
