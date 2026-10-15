/**
 * ValidateCommand - CLI Release Inspector & Multi-Format Validator.
 * Validates PMaC compliance, tasks, criteria, parity and outputs in text, json, nan0, or csv.
 */
export class ValidateCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        header: string;
        scanningCount: string;
        projectHeader: string;
        noReleases: string;
        savedReport: string;
        summary: string;
    };
    static target: {
        help: string;
        default: string;
        type: string;
        positional: boolean;
    };
    static format: {
        help: string;
        default: string;
        options: string[];
        type: string;
        alias: string;
    };
    static output: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static registryFile: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static all: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    /**
     * @param {Partial<ValidateCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ValidateCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */ target: string;
    /** @type {'text' | 'json' | 'nan0' | 'csv'} */ format: "text" | "json" | "nan0" | "csv";
    /** @type {string} */ output: string;
    /** @type {string} */ registryFile: string;
    /** @type {boolean} */ all: boolean;
    /**
     * Execute release validation and format rendering
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { success: boolean, releases: any[], output: string }, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, {
        success: boolean;
        releases: any[];
        output: string;
    }, any>;
    #private;
}
export default ValidateCommand;
import { ModelAsApp } from '@nan0web/ui';
