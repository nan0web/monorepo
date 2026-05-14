/**
 * @typedef {Object} HygieneError
 * @property {string} check Name of the check being performed.
 * @property {string} error Error key for i18n.
 */
/**
 * HygieneAuditor — Verifies required package scripts and configuration files.
 */
export class HygieneAuditor extends AuditorModel {
    /** @type {Object<string, string>} UI messages for hygiene steps */
    static UI: {
        [x: string]: string;
    };
    /**
     * Runs the hygiene audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
    /**
     * Abstract check for platform hygiene.
     * @param {HygieneError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    checkPlatformHygiene(errors: HygieneError[], t: import("@nan0web/i18n").TFunction): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
export type HygieneError = {
    /**
     * Name of the check being performed.
     */
    check: string;
    /**
     * Error key for i18n.
     */
    error: string;
};
import { AuditorModel } from '../AuditorModel.js';
