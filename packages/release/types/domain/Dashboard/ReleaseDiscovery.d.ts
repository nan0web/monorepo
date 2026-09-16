/**
 * Parse semver string into [major, minor, patch] numbers
 * @param {string} [v='']
 * @returns {[number, number, number]}
 */
export function parseSemver(v?: string): [number, number, number];
/**
 * Compare two semver strings in descending order
 * @param {string} [a='']
 * @param {string} [b='']
 * @returns {number}
 */
export function compareSemverDesc(a?: string, b?: string): number;
/**
 * Format release version to path segments e.g. "1.0.0" -> "1/0/v1.0.0"
 * @param {string} [version='']
 * @returns {string}
 */
export function versionToPath(version?: string): string;
/**
 * Check whether a document exists in the virtual database
 * @param {any} db
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export function documentExists(db: any, path: string): Promise<boolean>;
/**
 * Load release doc (release.md, task.md, plan.md) and extract tasks
 * @param {any} db
 * @param {string} releaseDir
 * @returns {Promise<{ releaseContent: string, sourceDoc: string, tasks: import('./ReleaseParser.js').TaskItem[] }>}
 */
export function loadReleaseDoc(db: any, releaseDir: string): Promise<{
    releaseContent: string;
    sourceDoc: string;
    tasks: import("./ReleaseParser.js").TaskItem[];
}>;
/**
 * Discover release version directories using database listDir
 * @param {any} db
 * @param {string} projectRoot
 * @returns {Promise<Array<{ version: string, path: string }>>}
 */
export function discoverReleases(db: any, projectRoot: string): Promise<Array<{
    version: string;
    path: string;
}>>;
