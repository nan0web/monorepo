/**
 * @typedef {Object} ReleaseConfig
 * @property {string} [version] - Release version
 * @property {string | number | Date | undefined} [createdAt] -
 * @property {string | number | Date | undefined} [date] - Alias for createdAt
 * @property {string | number | Date | undefined} [startAt] -
 * @property {string | number | Date | undefined} [planAt] -
 * @property {string | number | Date | undefined} [completeAt] -
 * @property {string | ReleaseDocument} [document] -
 * @property {Map<string, Function>} [tasks] - Task map with test functions
 */
/**
 * Release management class that coordinates task validation and release execution
 */
export default class Release {
    /**
     * Creates a Release instance
     * @param {ReleaseConfig} config - Release configuration
     */
    constructor(config?: ReleaseConfig);
    /** @type {string} */
    version: string;
    /** @type {Date} */
    createdAt: Date;
    /** @type {Date?} */
    startAt: Date | null;
    /** @type {Date?} */
    planAt: Date | null;
    /** @type {Date?} */
    completeAt: Date | null;
    /** @type {Map<string, Function>} */
    tasks: Map<string, Function>;
    /** @type {ReleaseDocument} */
    document: ReleaseDocument;
    /** @type {Logger} */
    logger: Logger;
    get path(): string;
    /**
     * Validate release by running all task tests
     * @returns {Promise<Object>} Validation results
     */
    validate(): Promise<any>;
    /**
     * Execute release process
     * @param {Object} options - Release options
     * @param {boolean} [options.ignoreFailTests=false] - Ignore failed tests
     * @returns {Promise<boolean>} Release success status
     */
    execute(options?: {
        ignoreFailTests?: boolean | undefined;
    }): Promise<boolean>;
    /**
     * Get release progress statistics
     * @returns {Promise<Object>} Progress statistics
     */
    getProgress(): Promise<any>;
}
export type ReleaseConfig = {
    /**
     * - Release version
     */
    version?: string | undefined;
    /**
     * -
     */
    createdAt?: string | number | Date | undefined;
    /**
     * - Alias for createdAt
     */
    date?: string | number | Date | undefined;
    /**
     * -
     */
    startAt?: string | number | Date | undefined;
    /**
     * -
     */
    planAt?: string | number | Date | undefined;
    /**
     * -
     */
    completeAt?: string | number | Date | undefined;
    /**
     * -
     */
    document?: string | ReleaseDocument | undefined;
    /**
     * - Task map with test functions
     */
    tasks?: Map<string, Function> | undefined;
};
import ReleaseDocument from './Release/Document.js';
import Logger from '@nan0web/log';
