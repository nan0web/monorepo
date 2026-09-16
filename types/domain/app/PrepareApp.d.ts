export default class PrepareApp extends ModelAsApp {
    static target: {
        help: string;
        default: string;
        positional: boolean;
    };
    static step: {
        help: string;
        default: number;
        type: string;
    };
    static UI: {
        title: string;
        starting: string;
        compiled: string;
        sessionSaved: string;
        promptSaved: string;
        errorNoDb: string;
    };
    /**
     * @param {Partial<PrepareApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<PrepareApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Target package directory (e.g. packages/ui). */
    target: string;
    /** @type {number} Target step number (1 to 9). */
    step: number;
}
import { ModelAsApp } from '@nan0web/ui';
