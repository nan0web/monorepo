/**
 * @typedef {Object} VerificationError
 * @property {string} check Name of the verification check.
 * @property {string} error Error key for i18n.
 */
/**
 * VerificationAuditor — Verifies existence of play/, unit tests, and ProvenDocs.
 */
export class VerificationAuditor extends AuditorModel {
    /** @type {Object<string, string>} UI messages for verification steps */
    static UI: {
        [x: string]: string;
    };
    /**
     * Abstract check for test files, should be implemented by child classes.
     * @param {import('@nan0web/db').DocumentEntry} entry
     * @returns {boolean}
     */
    isTestFile(entry: import("@nan0web/db").DocumentEntry): boolean;
    /**
     * Abstract check for ignored directories, should be implemented by child classes.
     * @param {import('@nan0web/db').DocumentEntry} entry
     * @returns {boolean}
     */
    isIgnoredDir(entry: import("@nan0web/db").DocumentEntry): boolean;
    /**
     * The pattern missing tests are expected to match (for UI string interpolation).
     * @returns {string}
     */
    get missingTestsPattern(): string;
    /**
     * Recursively collect all test files using DB.browse.
     * @param {string} dir
     * @returns {Promise<string[]>}
     * @private
     */
    private _collectTestFiles;
    /**
     * Runs the verification and documentation audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
export type VerificationError = {
    /**
     * Name of the verification check.
     */
    check: string;
    /**
     * Error key for i18n.
     */
    error: string;
};
import { AuditorModel } from '../AuditorModel.js';
