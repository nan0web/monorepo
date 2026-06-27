/**
 * WorkflowListModel — lists all available workflow files.
 */
export class WorkflowListModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        empty: string;
        errorNoDb: string;
        errorNoWorkflowsDir: string;
    };
    static locale: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<WorkflowListModel>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<WorkflowListModel>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Workflow locale */ locale: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
/**
 * WorkflowShowModel — outputs the content of a single workflow file.
 */
export class WorkflowShowModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        notFound: string;
        promptName: string;
    };
    static name: {
        help: string;
        default: string;
        positional: boolean;
    };
    static locale: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<WorkflowShowModel>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<WorkflowShowModel>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Workflow name */ name: string;
    /** @type {string} Locale */ locale: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
/**
 * WorkflowApp — container command for workflow management.
 * Subcommands: list, show.
 */
export class WorkflowApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
    };
    static command: {
        help: string;
        options: (typeof WorkflowListModel | typeof WorkflowShowModel)[];
        default: typeof WorkflowListModel;
        positional: boolean;
    };
    /**
     * @param {Partial<WorkflowApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<WorkflowApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {WorkflowListModel | WorkflowShowModel} */ command: WorkflowListModel | WorkflowShowModel;
}
import { ModelAsApp } from '@nan0web/ui';
