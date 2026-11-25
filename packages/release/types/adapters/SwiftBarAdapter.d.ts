/**
 * SwiftBarAdapter formats task state into SwiftBar/Argos menu lines.
 */
export class SwiftBarAdapter {
    static UI: {
        sectionWork: string;
        sectionToday: string;
        sectionPool: string;
        sectionPending: string;
        sectionFuture: string;
        sectionProjects: string;
        openWeb: string;
        actions: {
            work: string;
            done: string;
            pause: string;
            todo: string;
        };
    };
    static STATUS_TRANSITIONS: {
        done: string[];
        todo: string[];
        work: string[];
        pause: string[];
        fail: string[];
    };
    /**
     * Escape pipe characters so each SwiftBar line has at most one "|".
     * @param {string} value
     * @returns {string}
     */
    static sanitizePipe(value: string): string;
    /**
     * Wrap text into lines up to maxLen characters.
     * @param {string} text
     * @param {number} [maxLen=65]
     * @returns {string[]}
     */
    static wrapText(text: string, maxLen?: number): string[];
    /**
     * Format a single SwiftBar menu line with optional parameters.
     * @param {string} label
     * @param {string} [params='']
     * @returns {string}
     */
    static formatLine(label: string, params?: string): string;
    /**
     * Quote argument if it contains whitespace so SwiftBar passes it intact.
     * @param {string} arg
     * @returns {string}
     */
    static quoteArg(arg: string): string;
    /**
     * Build SwiftBar bash command parameters using bin or node invocation mode.
     * @param {SwiftBarState} state
     * @param {string[]} args
     * @returns {string}
     */
    static buildCmd(state: SwiftBarState, args: string[]): string;
    /**
     * Render top menu bar header line with completion/progress summary and telemetry.
     * @param {TaskModel[]} tasks
     * @returns {string}
     */
    static renderHeader(tasks: TaskModel[]): string;
    /**
     * Render telemetry and quick-open sub-items for a task.
     * @param {TaskModel} task
     * @param {SwiftBarState} state
     * @returns {string[]}
     */
    static renderTaskTelemetry(task: TaskModel, state: SwiftBarState): string[];
    /**
     * Render a single task item with wrapped fullText, telemetry, and status actions.
     * @param {TaskModel} task
     * @param {SwiftBarState} state
     * @returns {string[]}
     */
    static renderTaskItem(task: TaskModel, state: SwiftBarState): string[];
    /**
     * Render complete SwiftBar menu output for all task sections and projects.
     * @param {SwiftBarState} [state={}]
     * @returns {string}
     */
    static render(state?: SwiftBarState): string;
}
export default SwiftBarAdapter;
export type SwiftBarState = {
    /**
     * - Today's tasks.
     */
    today?: TaskModel[] | undefined;
    /**
     * - Priority pool tasks.
     */
    pool?: TaskModel[] | undefined;
    /**
     * - Scheduled future tasks.
     */
    future?: TaskModel[] | undefined;
    /**
     * - Pending tasks from previous days.
     */
    pendingOld?: TaskModel[] | undefined;
    /**
     * - Loaded projects map entries.
     */
    projects?: Record<string, any> | undefined;
    /**
     * - Explicit binary path override.
     */
    binPath?: string | undefined;
    /**
     * - Invocation mode: 'bin' | 'node'.
     */
    binMode?: string | undefined;
    /**
     * - Optional i18n translator.
     */
    t?: ((tpl: string, vars?: Record<string, unknown>) => string) | undefined;
};
import { TaskModel } from '../domain/Task/TaskModel.js';
