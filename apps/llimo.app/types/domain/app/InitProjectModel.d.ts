/**
 * Initializes a new OLMUI project (JS, TS, or PY)
 *
 * @property {string} dir Target directory to initialize
 * @property {'js'|'ts'|'py'} lang Language for the project (js, ts, or py)
 * @property {boolean} quiet Quiet mode
 */
export class InitProjectModel extends ModelAsApp {
    static alias: string;
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
    constructor(data?: {}, options?: {});
    /** @type {string} Target directory to initialize */ dir: string;
    /** @type {'js'|'ts'|'py'} Language for the project */ lang: "js" | "ts" | "py";
    /** @type {boolean} Quiet mode */ quiet: boolean;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
