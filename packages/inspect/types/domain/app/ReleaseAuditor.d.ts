/**
 * ReleaseAuditor — Validates release directories (task.md, task.spec.js, user.md).
 */
export class ReleaseAuditor extends AuditorModel {
    static recursive: {
        type: string;
        alias: string;
        help: string;
        default: boolean;
    };
    static out: {
        type: string;
        alias: string;
        help: string;
        default: string;
    };
    static report: {
        type: string;
        help: string;
        default: string;
    };
    static UI: {
        title: string;
        description: string;
        starting: string;
        ok: string;
        missing_file: string;
    };
    /**
     * @param {Partial<ReleaseAuditor>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ReleaseAuditor>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {boolean} Recursively scan subdirectories */ recursive: boolean;
    /** @type {string} Path to save markdown report */ out: string;
    /** @type {string} Path to save markdown report */ report: string;
    /**
     * Runs the release audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { AuditorModel } from '../AuditorModel.js';
