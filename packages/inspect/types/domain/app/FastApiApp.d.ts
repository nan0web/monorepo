/**
 * FastApiApp — CLI subcommand to inspect API skeleton/contracts from AST.
 */
export class FastApiApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
        reading: string;
        error_no_db: string;
        error_missing_path: string;
    };
    static path: {
        type: string;
        help: string;
        positional: boolean;
        default: string;
    };
    static level: {
        type: string;
        help: string;
        default: string;
    };
    static only: {
        type: string;
        help: string;
        default: string;
    };
    static style: {
        type: string;
        help: string;
        default: string;
    };
    static includeDeps: {
        type: string;
        help: string;
        default: boolean;
    };
    static format: {
        type: string;
        help: string;
        default: string;
    };
    /**
     * @param {Partial<FastApiApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<FastApiApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Path to source or declaration file (.d.ts / .js) */ path: string;
    /** @type {string} Level of inspection depth: classes | methods | fields | all */ level: string;
    /** @type {string} Filter entities: static | async | methods | fields */ only: string;
    /** @type {string} Outline detail style: short | full */ style: string;
    /** @type {boolean} Include imported external dependencies */ includeDeps: boolean;
    /** @type {string} Output format: nano | json */ format: string;
    /**
     * Execute Fast API inspection.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
