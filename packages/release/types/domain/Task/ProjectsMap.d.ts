/**
 * ProjectsMap (Model-as-Schema)
 * Loads projects.nan0 and resolves project keys from task text/hashtags/keywords.
 */
export class ProjectsMap extends Model {
    static entries: {
        type: string;
        default: {};
        help: string;
    };
    /**
     * @param {Record<string, any>} raw
     * @returns {Record<string, { dir: string, hashtags: string[], keywords: string[] }>}
     */
    static normalizeEntries(raw: Record<string, any>): Record<string, {
        dir: string;
        hashtags: string[];
        keywords: string[];
    }>;
    /**
     * Load ProjectsMap from $db (projects.nan0).
     * @param {import('@nan0web/db').default} db
     * @returns {Promise<ProjectsMap>}
     */
    static load(db: import("@nan0web/db").default): Promise<ProjectsMap>;
    /**
     * @param {Partial<ProjectsMap>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ProjectsMap>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {Record<string, { dir: string, hashtags?: string[], keywords?: string[] }>} */
    entries: Record<string, {
        dir: string;
        hashtags?: string[];
        keywords?: string[];
    }>;
    /**
     * Resolve project key in order: [project:key] -> #hashtag -> keywords.
     * @param {string | TaskModel} taskOrText
     * @param {string} [domain='']
     * @returns {string}
     */
    resolveProject(taskOrText: string | TaskModel, domain?: string): string;
    /**
     * Open resolved project directory in Antigravity IDE.
     * @param {string} projectKey
     * @param {import('../../adapters/SystemAdapter.js').SystemAdapter} system
     * @returns {Promise<{ ok: boolean, project: string, dir?: string, reason?: string }>}
     */
    openInIde(projectKey: string, system: import("../../adapters/SystemAdapter.js").SystemAdapter): Promise<{
        ok: boolean;
        project: string;
        dir?: string;
        reason?: string;
    }>;
}
export default ProjectsMap;
import { Model } from '@nan0web/types';
import { TaskModel } from './TaskModel.js';
