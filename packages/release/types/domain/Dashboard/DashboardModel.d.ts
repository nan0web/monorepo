/**
 * @typedef {import('./ReleaseParser.js').TaskItem} TaskItem
 * @typedef {Object} ProjectDashboardEntry
 * @property {string} path - Relative project path
 * @property {string} name - Project name
 * @property {string} version - Current release version
 * @property {number} hours - Development hours spent
 * @property {number} iterations - Test runs / refactor iterations
 * @property {number} rrs - Release Readiness Score
 * @property {'wip' | 'closed' | 'unknown'} status - Release state
 * @property {TaskItem[]} tasks - Parsed tasks from release.md
 * @property {string} branch - Git branch name
 * @property {'clean' | 'dirty'} gitStatus - Git workspace status
 * @property {string} userContent - Raw user.md content
 * @property {string} releaseContent - Raw release.md content
 * @property {string} sourceDoc - Relative path to the parsed release document
 * @property {string} sourceUserDoc - Relative path to user.md
 * @property {string?} deadline - Project release deadline
 * @property {number?} daysRemaining - Days remaining until deadline
 * @property {string?} priority - Priority (0 | 1 | 2 | 3)
 * @property {number} [releasesCount] - Number of releases found
 * @property {number} [totalHours] - Total hours across all releases
 * @property {number} [totalIterations] - Total iterations across all releases
 * @property {Array<any>} [allReleases] - List of all releases for project
 *
 * @typedef {Object} DashboardSummary
 * @property {number} totalProjects - Total tracked projects
 * @property {number} totalHours - Sum of hours across projects
 * @property {number} totalIterations - Sum of iterations
 * @property {number} wipCount - Active WIP releases
 * @property {number} closedCount - Closed releases
 * @property {number} [totalReleases] - Total releases counted
 */
/**
 * DashboardModel - Aggregates release telemetry, tasks and readiness across projects.
 */
export class DashboardModel extends ModelAsApp {
    static registryFile: {
        help: string;
        default: string;
        type: string;
    };
    static summary: {
        help: string;
        default: {
            totalProjects: number;
            totalHours: number;
            totalIterations: number;
            wipCount: number;
            closedCount: number;
        };
        type: string;
    };
    static projects: {
        help: string;
        default: () => never[];
        type: string;
    };
    static UI: {
        aggregating: string;
        done: string;
    };
    static parseUserMetrics: typeof parseUserMetrics;
    static normalizePriority: typeof normalizePriority;
    static sortTasks: typeof sortTasks;
    static versionToPath: typeof versionToPath;
    /**
     * @param {Partial<DashboardModel>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions & { gitTelemetry?: any }>} [options={}]
     */
    constructor(data?: Partial<DashboardModel>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions & {
        gitTelemetry?: any;
    }>);
    /** @type {string} Path to releases.txt registry file */ registryFile: string;
    /** @type {DashboardSummary} Aggregated metrics summary */ summary: DashboardSummary;
    /** @type {ProjectDashboardEntry[]} List of projects with metrics */ projects: ProjectDashboardEntry[];
    /** @type {any} Optional git telemetry adapter */
    _gitTelemetry: any;
    /**
     * Canonical OLMUI Generator: Yields progress, show, and returns result.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
    /**
     * Programmatic aggregation helper
     * @param {Function} [onProgress]
     * @returns {Promise<{ summary: DashboardSummary, projects: ProjectDashboardEntry[] }>}
     */
    aggregate(onProgress?: Function): Promise<{
        summary: DashboardSummary;
        projects: ProjectDashboardEntry[];
    }>;
    aggregateStream(): AsyncGenerator<{
        current: number;
        total: number;
        project: string;
    }, {
        summary: DashboardSummary;
        projects: ({
            name: any;
            version: any;
            path: any;
            status: string;
            hours: number;
            iterations: number;
            rrs: number;
            branch: any;
            gitStatus: any;
            tasks: never[];
            deadline: null;
            daysRemaining: null;
            priority: string;
            releasesCount: number;
            totalHours: number;
            totalIterations: number;
            allReleases: never[];
            sourceDoc: string;
            sourceUserDoc: string;
            userContent: string;
            releaseContent: string;
        } | {
            path: string;
            name: string;
            version: string;
            hours: number;
            iterations: number;
            totalHours: number;
            totalIterations: number;
            releasesCount: number;
            allReleases: {
                version: any;
                path: any;
                hours: number;
                iterations: number;
                rrs: number;
                status: "wip" | "closed" | "unknown";
                tasks: import("./ReleaseParser.js").TaskItem[];
                sourceDoc: string;
            }[];
            rrs: number;
            status: "wip" | "closed" | "unknown";
            tasks: import("./ReleaseParser.js").TaskItem[];
            branch: any;
            gitStatus: any;
            userContent: string;
            releaseContent: string;
            sourceDoc: string;
            sourceUserDoc: string;
            deadline: any;
            daysRemaining: number | null;
            priority: "0" | "1" | "2" | "3";
        })[];
    }, unknown>;
    #private;
}
export type TaskItem = import("./ReleaseParser.js").TaskItem;
export type ProjectDashboardEntry = {
    /**
     * - Relative project path
     */
    path: string;
    /**
     * - Project name
     */
    name: string;
    /**
     * - Current release version
     */
    version: string;
    /**
     * - Development hours spent
     */
    hours: number;
    /**
     * - Test runs / refactor iterations
     */
    iterations: number;
    /**
     * - Release Readiness Score
     */
    rrs: number;
    /**
     * - Release state
     */
    status: "wip" | "closed" | "unknown";
    /**
     * - Parsed tasks from release.md
     */
    tasks: TaskItem[];
    /**
     * - Git branch name
     */
    branch: string;
    /**
     * - Git workspace status
     */
    gitStatus: "clean" | "dirty";
    /**
     * - Raw user.md content
     */
    userContent: string;
    /**
     * - Raw release.md content
     */
    releaseContent: string;
    /**
     * - Relative path to the parsed release document
     */
    sourceDoc: string;
    /**
     * - Relative path to user.md
     */
    sourceUserDoc: string;
    /**
     * - Project release deadline
     */
    deadline: string | null;
    /**
     * - Days remaining until deadline
     */
    daysRemaining: number | null;
    /**
     * - Priority (0 | 1 | 2 | 3)
     */
    priority: string | null;
    /**
     * - Number of releases found
     */
    releasesCount?: number | undefined;
    /**
     * - Total hours across all releases
     */
    totalHours?: number | undefined;
    /**
     * - Total iterations across all releases
     */
    totalIterations?: number | undefined;
    /**
     * - List of all releases for project
     */
    allReleases?: any[] | undefined;
};
export type DashboardSummary = {
    /**
     * - Total tracked projects
     */
    totalProjects: number;
    /**
     * - Sum of hours across projects
     */
    totalHours: number;
    /**
     * - Sum of iterations
     */
    totalIterations: number;
    /**
     * - Active WIP releases
     */
    wipCount: number;
    /**
     * - Closed releases
     */
    closedCount: number;
    /**
     * - Total releases counted
     */
    totalReleases?: number | undefined;
};
import { ModelAsApp } from '@nan0web/ui';
import { parseUserMetrics } from './ReleaseParser.js';
import { normalizePriority } from './ReleaseParser.js';
import { sortTasks } from './ReleaseParser.js';
import { versionToPath } from './ReleaseDiscovery.js';
