import { ModelAsApp } from '@nan0web/ui';
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
    goal?: string;
    version: string;
    langs?: any[];
    archScore?: any;
};
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
 * @property {string} version
 * @property {any[]} [langs]
 * @property {any} [archScore]
 */
export default class AuditMonorepoApp extends ModelAsApp {
    static UI: {
        title: string;
        collecting: string;
        collected: string;
        scanning: string;
        completed: string;
        reportUpdated: string;
        dbRequired: string;
        colModule: string;
        colVersion: string;
        colGoal: string;
        colLangs: string;
        colTasks: string;
        colHealth: string;
        colLicense: string;
        generatedOn: string;
        healthUnknown: string;
        healthGood: string;
        healthMedium: string;
        healthBad: string;
        core: string;
        lab: string;
        seeds: string;
        missingPurpose: string;
    };
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
    /**
     * @param {any} content
     * @returns {string|null}
     */
    extractGoal(content: any): string | null;
    /**
     * Find the highest version of packages in the monorepo
     * @param {ModuleAuditResult[]} scanned
     * @returns {string}
     */
    getCoreVersion(scanned: ModuleAuditResult[]): string;
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
