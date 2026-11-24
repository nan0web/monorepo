/**
 * TodoCommand (ModelAsApp)
 * Deterministic CLI Controller for release tasks (MDTaskList & MDTable).
 */
export class TodoCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        scan_start: string;
        mutation_success: string;
        task_not_found: string;
        drift_error: string;
    };
    static format: {
        type: string;
        default: string;
        help: string;
    };
    static file: {
        type: string;
        help: string;
    };
    static done: {
        type: string;
        help: string;
    };
    static undo: {
        type: string;
        help: string;
    };
    static status: {
        type: string;
        help: string;
    };
    /**
     * Extract tasks from Markdown AST (both MDListItem and MDTable).
     * @param {Markdown} ast
     * @param {string} [filePath='']
     * @param {{ evaluator?: import('./Task/PriorityEvaluator.js').PriorityEvaluatorFn }} [options={}]
     * @returns {TaskModel[]}
     */
    static extractTasks(ast: Markdown, filePath?: string, options?: {
        evaluator?: import("./Task/PriorityEvaluator.js").PriorityEvaluatorFn;
    }): TaskModel[];
    /**
     * @param {MDTable} table
     * @param {string} filePath
     * @param {import('./Task/PriorityEvaluator.js').PriorityEvaluatorFn} [evaluator]
     * @returns {TaskModel[]}
     */
    static extractTableTasks(table: MDTable, filePath: string, evaluator?: import("./Task/PriorityEvaluator.js").PriorityEvaluatorFn): TaskModel[];
    /**
     * Mutate task status in Markdown AST (MDListItem or MDTableRow).
     * @param {Markdown} ast
     * @param {string | number | boolean} targetTitleOrBadge
     * @param {'todo' | 'work' | 'done' | 'pause' | 'fail'} newStatus
     * @returns {boolean}
     */
    static mutateTask(ast: Markdown, targetTitleOrBadge: string | number | boolean, newStatus: "todo" | "work" | "done" | "pause" | "fail"): boolean;
    /**
     * @param {TaskModel[]} tasks
     * @param {string} [format='cli']
     * @returns {string}
     */
    static formatTasks(tasks: TaskModel[], format?: string): string;
    /**
     * @param {Partial<TodoCommand>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<TodoCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */ format: string;
    /** @type {string} */ file: string;
    /** @type {string} */ done: string;
    /** @type {string} */ undo: string;
    /** @type {string} */ status: string;
    /**
     * @returns {Promise<string>}
     */
    resolveFile(): Promise<string>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export default TodoCommand;
import { ModelAsApp } from '@nan0web/ui-cli';
import { Markdown } from '@nan0web/markdown';
import { TaskModel } from './Task/TaskModel.js';
import { MDTable } from '@nan0web/markdown';
import { MarkdownRoundTripAuditor } from './Task/MarkdownRoundTripAuditor.js';
export { TaskModel, MarkdownRoundTripAuditor };
