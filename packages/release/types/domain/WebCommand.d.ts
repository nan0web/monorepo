/**
 * WebCommand - ModelAsApp Subcommand to generate and launch PM-as-Code Web Dashboard.
 */
export default class WebCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        help: string;
        loading: string;
        generated: string;
        serving: string;
    };
    static registryFile: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static out: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static port: {
        help: string;
        default: number;
        type: string;
        alias: string;
    };
    static open: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<WebCommand>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<WebCommand>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */ registryFile: string;
    /** @type {string} */ out: string;
    /** @type {number} */ port: number;
    /** @type {boolean} */ open: boolean;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
