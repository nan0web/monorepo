/**
 * TodoCommand (ModelAsApp)
 * Deterministic CLI Controller for release tasks.
 * Supports:
 * - Formats: --format=cli|json|md|text
 * - Filters/Files: --file=<path>
 * - Mutations: --done="<id|title>", --undo="<id|title>"
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
    /**
     * Extract tasks from Markdown AST.
     * @param {Markdown} ast
     * @param {string} filePath
     * @returns {TaskModel[]}
     */
    static extractTasks(ast: Markdown, filePath?: string): TaskModel[];
    /**
     * Mutate task status in Markdown AST.
     * @param {Markdown} ast
     * @param {string} targetTitleOrBadge
     * @param {'done' | 'todo'} newStatus
     * @returns {boolean} Whether any item was mutated
     */
    static mutateTask(ast: Markdown, targetTitleOrBadge: string, newStatus: "done" | "todo"): boolean;
    /**
     * Format tasks according to target format.
     * @param {TaskModel[]} tasks
     * @param {string} format
     * @returns {string}
     */
    static formatTasks(tasks: TaskModel[], format?: string): string;
    /**
     * @param {Partial<TodoCommand>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<TodoCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */
    format: string;
    /** @type {string} */
    file: string;
    /** @type {string} */
    done: string;
    /** @type {string} */
    undo: string;
    /**
     * Find default task file if not specified.
     * @returns {Promise<string>}
     */
    resolveFile(): Promise<string>;
    /**
     * Run TodoCommand generator.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { status: string, tasks?: TaskModel[] }, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, {
        status: string;
        tasks?: TaskModel[];
    }, any>;
}
export default TodoCommand;
import { ModelAsApp } from '@nan0web/ui-cli';
import { TaskModel } from './Task/TaskModel.js';
import { Markdown } from '@nan0web/markdown';
import { MarkdownRoundTripAuditor } from './Task/MarkdownRoundTripAuditor.js';
export { TaskModel, MarkdownRoundTripAuditor };
