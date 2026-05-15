/**
 * @typedef {Object} TaskSummary
 * @property {number} total
 * @property {number} completed
 */
/**
 * @typedef {Object} ModuleAuditResult
 * @property {string} name
 * @property {string} type
 * @property {string} path
 * @property {Record<string, TaskSummary>} files
 * @property {boolean} isCommercial
 * @property {string} license
 * @property {string} [goal]
 * @property {string} [version]
 * @property {any[]} [langs]
 * @property {any} [archScore]
 */
export default class AuditMonorepoApp extends ModelAsApp {
    static UI: {
        title: string;
        scanning: string;
        completed: string;
        reportUpdated: string;
        dbRequired: string;
    };
    /**
     * @param {any} content
     * @returns {string|null}
     */
    extractGoal(content: any): string | null;
    /**
     * Extracts task statistics from markdown content.
     * @param {ModuleAuditResult[]} scanned
     * @returns {string}
     */
    generateReport(scanned: ModuleAuditResult[]): string;
    /**
     * Extracts task statistics from markdown content.
     * @param {string} content
     * @returns {TaskSummary}
     */
    parseTasks(content: string): TaskSummary;
    /**
     * @param {string} pkgPath
     * @returns {Promise<any|null>}
     */
    runArchAudit(pkgPath: string): Promise<any | null>;
}
export type TaskSummary = {
    total: number;
    completed: number;
};
export type ModuleAuditResult = {
    name: string;
    type: string;
    path: string;
    files: Record<string, TaskSummary>;
    isCommercial: boolean;
    license: string;
    goal?: string | undefined;
    version?: string | undefined;
    langs?: any[] | undefined;
    archScore?: any;
};
import { ModelAsApp } from '@nan0web/ui';
