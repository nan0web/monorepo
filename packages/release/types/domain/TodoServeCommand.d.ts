/**
 * TodoServeCommand (ModelAsApp)
 * Minimal HTTP server for interactive task matrix (https://todo.test).
 */
export class TodoServeCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static port: {
        type: string;
        default: number;
        alias: string;
        help: string;
    };
    static file: {
        type: string;
        default: string;
        help: string;
    };
    /**
     * @param {Partial<TodoServeCommand>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options={}]
     */
    constructor(data?: Partial<TodoServeCommand>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        system?: SystemAdapter;
    });
    /** @type {number} */ port: number;
    /** @type {string} */ file: string;
    /** @type {SystemAdapter} */ $system: SystemAdapter;
    /**
     * @param {string} filePath
     * @returns {Promise<import('./Task/TaskModel.js').TaskModel[]>}
     */
    loadTasks(filePath: string): Promise<import("./Task/TaskModel.js").TaskModel[]>;
    /**
     * Build JSON state for GET /api/tasks.
     * @returns {Promise<object>}
     */
    getState(): Promise<object>;
    /**
     * Update status for POST /api/status.
     * @param {{ file?: string, target: string, status: string }} payload
     * @returns {Promise<object>}
     */
    updateStatus(payload: {
        file?: string;
        target: string;
        status: string;
    }): Promise<object>;
    /**
     * Handle HTTP request (testable without opening real socket).
     * @param {{ method?: string, url?: string, body?: string }} req
     * @returns {Promise<{ status: number, contentType: string, body: string }>}
     */
    handleRequest(req: {
        method?: string;
        url?: string;
        body?: string;
    }): Promise<{
        status: number;
        contentType: string;
        body: string;
    }>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export default TodoServeCommand;
import { ModelAsApp } from '@nan0web/ui';
import { SystemAdapter } from '../adapters/SystemAdapter.js';
