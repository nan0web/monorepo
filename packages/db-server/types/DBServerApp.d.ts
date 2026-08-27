import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * DBServerApp - ModelAsApp controller for @nan0web/db-server CLI.
 */
export declare class DBServerApp extends ModelAsApp {
    /** @type {string} */
    root: string;
    /** @type {number} */
    port: number;
    /** @type {string} */
    host: string;
    static alias: string;
    static UI: {
        title: string;
        init: string;
        running: string;
        explorer: string;
        help: string;
    };
    static root: {
        help: string;
        default: string;
        positional: boolean;
        alias: string;
    };
    static port: {
        help: string;
        errorInUse: string;
        default: number;
        alias: string;
    };
    static host: {
        help: string;
        default: string;
        alias: string;
    };
    /**
     * @param {Record<string, any>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Record<string, any>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * Run the DBServerApp logic.
     * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>;
}
