/**
 * PipelineListModel — lists all registered pipelines.
 */
export class PipelineListModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        empty: string;
    };
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").RenderIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * PipelineRunModel — runs a specific pipeline.
 */
export class PipelineRunModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        errorNoName: string;
        errorNotFound: string;
    };
    static name: {
        help: string;
        default: string;
        positional: boolean;
    };
    static task: {
        help: string;
        default: string;
        positional: boolean;
    };
    static autoVerify: {
        help: string;
        type: string;
        default: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ name: string;
    /** @type {string} */ task: string;
    /** @type {boolean} */ autoVerify: boolean;
    /** @type {string[]} */ _positionals: string[];
    run(): AsyncGenerator<any, import("@nan0web/ui/src/core/Intent.js").ResultIntent, any>;
}
/**
 * PipelineApp — container command for running AI pipelines.
 */
export class PipelineApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
    };
    static command: {
        help: string;
        options: (typeof PipelineListModel | typeof PipelineRunModel)[];
        default: typeof PipelineListModel;
        positional: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {any} */ command: any;
}
import { ModelAsApp } from '@nan0web/ui';
