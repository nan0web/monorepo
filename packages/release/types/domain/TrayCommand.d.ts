/**
 * TrayCommand (ModelAsApp)
 * Renders SwiftBar menu and handles tray actions (set-status, open-antigravity).
 */
export class TrayCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static action: {
        type: string;
        positional: boolean;
        default: string;
        help: string;
    };
    static file: {
        type: string;
        default: string;
        help: string;
    };
    static status: {
        type: string;
        default: string;
        help: string;
    };
    static target: {
        type: string;
        default: string;
        help: string;
    };
    static project: {
        type: string;
        default: string;
        help: string;
    };
    static binPath: {
        type: string;
        default: string;
        help: string;
    };
    static binMode: {
        type: string;
        default: string;
        help: string;
    };
    static slotsDir: {
        type: string;
        default: string;
        help: string;
    };
    /**
     * @param {Partial<TrayCommand>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options={}]
     */
    constructor(data?: Partial<TrayCommand>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        system?: SystemAdapter;
    });
    /** @type {string} */ action: string;
    /** @type {string} */ file: string;
    /** @type {string} */ status: string;
    /** @type {string} */ target: string;
    /** @type {string} */ project: string;
    /** @type {string} */ binPath: string;
    /** @type {string} */ binMode: string;
    /** @type {string} */ slotsDir: string;
    /** @type {SystemAdapter} */ $system: SystemAdapter;
    /**
     * Load isolated parallel slot telemetry records from slotsDir.
     * @returns {Promise<Record<string, any>[]>}
     */
    loadSlots(): Promise<Record<string, any>[]>;
    /**
     * Merge parallel slot telemetry into loaded tasks without mutating markdown files.
     * @param {import('./Task/TaskModel.js').TaskModel[]} tasks
     * @param {Record<string, any>[]} slots
     * @param {ProjectsMap} projectsMap
     */
    applySlots(tasks: import("./Task/TaskModel.js").TaskModel[], slots: Record<string, any>[], projectsMap: ProjectsMap): void;
    /**
     * @param {string} filePath
     * @returns {Promise<import('./Task/TaskModel.js').TaskModel[]>}
     */
    loadTasksFrom(filePath: string): Promise<import("./Task/TaskModel.js").TaskModel[]>;
    /**
     * Mirror status update between todo.md and pool.md.
     * @returns {Promise<{ ok: boolean, updatedFiles: string[] }>}
     */
    handleSetStatus(): Promise<{
        ok: boolean;
        updatedFiles: string[];
    }>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export default TrayCommand;
import { ModelAsApp } from '@nan0web/ui';
import { SystemAdapter } from '../adapters/SystemAdapter.js';
import { ProjectsMap } from './Task/ProjectsMap.js';
