/**
 * BatchCommand (ModelAsApp)
 * Detects targetFiles overlaps and dispatches up to 20 parallel tasks into isolated git worktrees.
 */
export class BatchCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        conflictError: string;
        dispatched: string;
    };
    static tasks: {
        type: string;
        default: () => never[];
        help: string;
    };
    static worktreeRoot: {
        type: string;
        default: string;
        help: string;
    };
    static maxParallel: {
        type: string;
        default: number;
        help: string;
    };
    static dryRun: {
        type: string;
        default: boolean;
        help: string;
    };
    /**
     * Detect overlapping targetFiles across a batch of tasks.
     * @param {Array<{ id?: string, title?: string, targetFiles?: string[] }>} tasks
     * @returns {Array<{ file: string, tasks: string[] }>}
     */
    static detectConflicts(tasks?: Array<{
        id?: string;
        title?: string;
        targetFiles?: string[];
    }>): Array<{
        file: string;
        tasks: string[];
    }>;
    /**
     * @param {Partial<BatchCommand>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: any }} [options={}]
     */
    constructor(data?: Partial<BatchCommand>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        system?: any;
    });
    /** @type {Array<{ id?: string, target?: string, targetFiles?: string[], branch?: string }>} */
    tasks: Array<{
        id?: string;
        target?: string;
        targetFiles?: string[];
        branch?: string;
    }>;
    /** @type {string} */ worktreeRoot: string;
    /** @type {number} */ maxParallel: number;
    /** @type {boolean} */ dryRun: boolean;
    /** @type {SystemAdapter} */ $system: SystemAdapter;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export default BatchCommand;
import { ModelAsApp } from '@nan0web/ui';
import { SystemAdapter } from '../adapters/SystemAdapter.js';
