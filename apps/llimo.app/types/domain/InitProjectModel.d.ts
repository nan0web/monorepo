/**
 * Initializes a new OLMUI project (JS, TS, or PY)
 *
 * @property {string} dir Target directory to initialize
 * @property {'js'|'ts'|'py'} lang Language for the project (js, ts, or py)
 * @property {boolean} quiet Quiet mode
 */
export class InitProjectModel extends Model {
    static dir: {
        help: string;
        default: string;
        positional: boolean;
    };
    static lang: {
        help: string;
        default: string;
        options: string[];
    };
    static quiet: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    static UI: {
        PACKAGE_JSON_CREATED: string;
        DIR_STRUCTURE_CREATED: string;
        NPM_INSTALL_RUN: string;
        NPM_INSTALL_SUCCESS: string;
        NPM_INSTALL_FAILED: string;
        SUCCESS: string;
    };
    /**
     * @param {Partial<InitProjectModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<InitProjectModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {any} Target directory to initialize */ dir: any;
    /** @type {any} Language for the project (js, ts, or py) */ lang: any;
    /** @type {boolean} Quiet mode */ quiet: boolean;
    set db(val: any);
    get db(): any;
    run(): AsyncGenerator<{
        type: string;
        message: string;
        level?: undefined;
        data?: undefined;
    } | {
        type: string;
        level: string;
        message: string;
        data?: undefined;
    } | {
        type: string;
        data: {
            success: boolean;
        };
        message: string;
        level?: undefined;
    }, void, unknown>;
    #private;
}
import { Model } from '@nan0web/types';
