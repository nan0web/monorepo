/**
 * Model-as-Schema for a single step within a LLiMo Workflow.
 */
export class WorkflowStepModel extends Model {
    static name: {
        help: string;
        default: string;
        type: string;
        validate: (val: any) => string | true;
    };
    static command: {
        help: string;
        default: string;
        type: string;
        validate: (val: any) => string | true;
    };
    static args: {
        help: string;
        default: never[];
        type: string;
    };
    static verify: {
        help: string;
        default: string;
        type: string;
    };
    static maxCost: {
        help: string;
        default: number;
        type: string;
    };
    static UI: {
        err_name: string;
        err_proxy: string;
    };
    constructor(data?: {});
    /** @type {string} The readable name or title of the step */ name: string;
    /** @type {string} The proxy command to execute (ALL commands must start with the at-symbol) */ command: string;
    /** @type {any[]} Arguments or payload block passed to the command */ args: any[];
    /** @type {string} Optional script to verify logic */ verify: string;
    /** @type {number} Maximum cost limit for this step or retry loop in case of LLM calls */ maxCost: number;
}
import { Model } from '@nan0web/types';
