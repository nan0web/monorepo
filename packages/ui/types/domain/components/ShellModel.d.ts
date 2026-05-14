/**
 * ShellModel — OLMUI Component Model for CLI Orchestration
 * Canonical CLI entry that describes available operations as a schema.
 */
export class ShellModel extends Model {
    static $id: string;
    static command: {
        help: string;
        type: string;
        default: null;
        positional: boolean;
        options: {
            label: string;
            value: string;
        }[];
        required: boolean;
    };
    static data: {
        help: string;
        type: string;
        default: string;
        alias: string;
    };
    static index: {
        help: string;
        type: string;
        default: string;
    };
    static locale: {
        help: string;
        type: string;
        default: string;
    };
    static port: {
        help: string;
        type: string;
        default: string;
    };
    /**
     * @param {object} data
     * @param {object} [options] External dependencies (AppRunner, SSRServer, etc.)
     */
    constructor(data?: object, options?: object);
    /** @type {string|null} */ command: string | null;
    /** @type {string} */ data: string;
    /** @type {string} */ index: string;
    /** @type {string} */ locale: string;
    /** @type {string} */ port: string;
    run(): AsyncGenerator<import("../../core/Intent.js").AskIntent | import("../../core/Intent.js").LogIntent, any, unknown>;
    #private;
}
import { Model } from '@nan0web/types';
