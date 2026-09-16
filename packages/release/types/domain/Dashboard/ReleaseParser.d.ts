/**
 * @typedef {Object} TaskItem
 * @property {string} content - Task title or description
 * @property {string} status - todo | InProgress | Done
 * @property {string} slug - Task slug / identifier
 * @property {'0' | '1' | '2' | '3'} [priority] - Numeric priority
 */
/**
 * Parse frontmatter YAML from markdown text
 * @param {*} input
 * @returns {Record<string, any>}
 */
export function parseFrontmatter(input: any): Record<string, any>;
/**
 * Normalize priority to numeric string '0' | '1' | '2' | '3'
 * @param {any} input
 * @returns {'0' | '1' | '2' | '3'}
 */
export function normalizePriority(input: any): "0" | "1" | "2" | "3";
/**
 * Extract clean task items from release markdown
 * @param {*} input
 * @returns {TaskItem[]}
 */
export function extractTasks(input: any): TaskItem[];
/**
 * Calculate days remaining until deadline
 * @param {string} [deadlineStr]
 * @returns {number | null}
 */
export function calculateDaysRemaining(deadlineStr?: string): number | null;
/**
 * Parse user.md content for telemetry metrics (hours, iterations, RRS) across languages
 * @param {*} [input]
 * @returns {{ hours: number, iterations: number, rrs: number }}
 */
export function parseUserMetrics(input?: any): {
    hours: number;
    iterations: number;
    rrs: number;
};
/**
 * Resolve priority from frontmatter or days remaining
 * @param {Record<string, any>} fm
 * @param {number | null} daysRemaining
 * @returns {'0' | '1' | '2' | '3'}
 */
export function resolvePriority(fm?: Record<string, any>, daysRemaining?: number | null): "0" | "1" | "2" | "3";
/**
 * Sort tasks by criteria ('priority', 'status', 'alphabetical')
 * @param {TaskItem[]} [tasks=[]]
 * @param {'priority' | 'status' | 'alphabetical'} [criteria='priority']
 * @returns {TaskItem[]}
 */
export function sortTasks(tasks?: TaskItem[], criteria?: "priority" | "status" | "alphabetical"): TaskItem[];
/**
 * Determine release status ('wip' | 'closed' | 'unknown')
 * @param {object} params
 * @returns {'wip' | 'closed' | 'unknown'}
 */
export function determineReleaseStatus({ fmStatus, hasSpec, hasTest, tasks, userStr, metrics }?: object): "wip" | "closed" | "unknown";
export type TaskItem = {
    /**
     * - Task title or description
     */
    content: string;
    /**
     * - todo | InProgress | Done
     */
    status: string;
    /**
     * - Task slug / identifier
     */
    slug: string;
    /**
     * - Numeric priority
     */
    priority?: "0" | "1" | "2" | "3" | undefined;
};
