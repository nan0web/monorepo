/**
 * WorkflowModel - LLiMo execution logic.
 * Orchestrates steps, enforces security, and detects environment registries.
 */
export class WorkflowModel extends Model {
    static filename: {
        help: string;
        default: string;
        type: string;
        positional: boolean;
        errorOnlyMd: string;
        validate: (v: any) => string | true;
    };
    static sandbox: {
        help: string;
        default: string;
    };
    static debug: {
        help: string;
        default: boolean;
        type: string;
    };
    static quiet: {
        help: string;
        default: boolean;
        type: string;
    };
    static budget: {
        help: string;
        default: number;
        type: string;
    };
    static steps: {
        help: string;
        default: never[];
        type: string;
    };
    static historyDir: {
        help: string;
        default: string;
        type: string;
    };
    static UI: {
        init: string;
        processing: string;
        executing: string;
        success: string;
        fail: string;
        finished: string;
        errorNoDb: string;
        errorSecurity: string;
        errorNoProxy: string;
    };
    /**
     * @param {Partial<WorkflowModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} options
     */
    constructor(data?: Partial<WorkflowModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Path to .md workflow */ filename: string;
    /** @type {any} Sandbox mode */ sandbox: any;
    /** @type {boolean} Debug mode */ debug: boolean;
    /** @type {boolean} Quiet mode */ quiet: boolean;
    /** @type {number} Execution budget limit */ budget: number;
    /** @type {WorkflowStepModel[]} Execution steps */ steps: WorkflowStepModel[];
    /** @type {string} Directory to store run history */ historyDir: string;
    _detectRegistry(): Promise<"pnpm" | "npm" | "go" | "yarn" | "cargo" | "cmake">;
    _parseSteps(filepath: any): Promise<any>;
    run(): AsyncGenerator<{
        type: string;
        message: any;
        level?: undefined;
        field?: undefined;
        command?: undefined;
        args?: undefined;
        quiet?: undefined;
    } | {
        type: string;
        level: string;
        message: any;
        field?: undefined;
        command?: undefined;
        args?: undefined;
        quiet?: undefined;
    } | {
        type: string;
        field: string;
        command: any;
        args: any[];
        quiet: boolean;
        message?: undefined;
        level?: undefined;
    }, {
        type: string;
        data: {
            status: string;
            reason: string;
            error?: undefined;
            duration?: undefined;
        };
    } | {
        type: string;
        data: {
            status: string;
            reason: string;
            error: any;
            duration?: undefined;
        };
    } | {
        type: string;
        data: {
            status: string;
            duration: number;
            reason?: undefined;
            error?: undefined;
        };
    }, unknown>;
}
import { Model } from '@nan0web/types';
import { WorkflowStepModel } from './WorkflowStepModel.js';
