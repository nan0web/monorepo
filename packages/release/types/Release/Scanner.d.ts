/**
 * @typedef {Object} ContractEntry
 * @property {string} version - Release version (e.g. "v1.0.0")
 * @property {string} path - Absolute path to the contract file
 * @property {string} type - "spec" or "test"
 * @property {string} dir - Directory containing the contract
 */
/**
 * @typedef {Object} VersionStatus
 * @property {string} version - Release version
 * @property {'wip' | 'closed' | 'mixed'} state - Version state
 * @property {string[]} specs - Paths to spec files
 * @property {string[]} tests - Paths to test files
 */
/**
 * Рекурсивний сканер для пошуку release контрактів.
 * Підтримує вкладену структуру: releases/{major}/{minor}/v{version}/
 * та плоску: releases/v{version}/
 */
export default class Scanner {
    /**
     * @param {string} root - Root directory of the project
     */
    constructor(root: string);
    /** @type {string} */
    root: string;
    /**
     * Find all .spec.js files (WIP contracts)
     * @param {string} [version] - Optional version filter
     * @returns {ContractEntry[]}
     */
    findSpecs(version?: string): ContractEntry[];
    /**
     * Find all .test.js files (Closed contracts)
     * @param {string} [version] - Optional version filter
     * @returns {ContractEntry[]}
     */
    findTests(version?: string): ContractEntry[];
    /**
     * Get status of all versions
     * @returns {VersionStatus[]}
     */
    status(): VersionStatus[];
    /**
     * Close a release: rename all .spec.js → .test.js
     * @param {string} [version] - Version to close. If omitted, closes all WIP.
     * @returns {{ closed: number, files: string[] }}
     */
    close(version?: string): {
        closed: number;
        files: string[];
    };
    #private;
}
export type ContractEntry = {
    /**
     * - Release version (e.g. "v1.0.0")
     */
    version: string;
    /**
     * - Absolute path to the contract file
     */
    path: string;
    /**
     * - "spec" or "test"
     */
    type: string;
    /**
     * - Directory containing the contract
     */
    dir: string;
};
export type VersionStatus = {
    /**
     * - Release version
     */
    version: string;
    /**
     * - Version state
     */
    state: "wip" | "closed" | "mixed";
    /**
     * - Paths to spec files
     */
    specs: string[];
    /**
     * - Paths to test files
     */
    tests: string[];
};
