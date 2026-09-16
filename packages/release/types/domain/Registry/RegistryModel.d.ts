/**
 * @typedef {Object} ProjectEntry
 * @property {string} path - Project relative or absolute path
 * @property {string} name - Package name from package.json or folder basename
 * @property {string} version - Package version from package.json
 */
/**
 * RegistryModel - PM-as-Code Project Registry manager.
 * Reads project paths from releases.txt and discovers package metadata.
 */
export class RegistryModel extends Model {
    static filePath: {
        help: string;
        default: string;
        type: string;
    };
    static projects: {
        help: string;
        default: () => never[];
        type: string;
    };
    static UI: {
        fileNotFound: string;
        loadingProjects: string;
        projectsLoaded: string;
    };
    /**
     * Parse raw content of releases.txt into array of clean paths
     * @param {string} content
     * @returns {string[]}
     */
    static parsePaths(content?: string): string[];
    /**
     * @param {Partial<RegistryModel>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<RegistryModel>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Path to registry file */ filePath: string;
    /** @type {ProjectEntry[]} List of registered projects */ projects: ProjectEntry[];
    /**
     * Load project entries from registry file using injected DB instance
     * @returns {Promise<ProjectEntry[]>}
     */
    loadProjects(): Promise<ProjectEntry[]>;
}
export default RegistryModel;
export type ProjectEntry = {
    /**
     * - Project relative or absolute path
     */
    path: string;
    /**
     * - Package name from package.json or folder basename
     */
    name: string;
    /**
     * - Package version from package.json
     */
    version: string;
};
import { Model } from '@nan0web/types';
