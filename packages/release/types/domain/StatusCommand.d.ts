/**
 * StatusCommand - ModelAsApp Subcommand to display PM-as-Code dashboard and project inspector.
 */
export default class StatusCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        help: string;
        header: string;
        summaryHeader: string;
        summaryRow1: string;
        summaryRow2: string;
        noProjects: string;
    };
    static registryFile: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static target: {
        help: string;
        default: string;
        positional: boolean;
        type: string;
    };
    static sort: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static write: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    /**
     * @param {Partial<StatusCommand>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<StatusCommand>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */ registryFile: string;
    /** @type {string} */ target: string;
    /** @type {string} */ sort: string;
    /** @type {boolean} */ write: boolean;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
    /**
     * Synchronize markdown status table between releases:status:start and releases:status:end
     * @param {any} db
     * @param {Array<any>} statuses
     * @param {string} [baseDir]
     */
    syncReadmeStatus(db: any, statuses?: Array<any>, baseDir?: string): Promise<void>;
}
import { ModelAsApp } from '@nan0web/ui';
