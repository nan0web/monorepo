/**
 * @typedef {Object} ExportError
 * @property {string} check Name of the export check.
 * @property {string} error Error key for i18n.
 */
/**
 * ExportAuditor — Verifies named exports, domain facades, and UI adapter exports.
 */
export class ExportAuditor extends AuditorModel {
    /** @type {Object<string, string>} UI messages for export steps */
    static UI: {
        [x: string]: string;
    };
    /**
     * Runs the export integrity audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
    /**
     * @abstract
     * @param {ExportError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     * @param {Function} fileExists
     * @param {Function} dirExists
     * @param {Function} readText
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    checkPlatformExports(errors: ExportError[], t: import("@nan0web/i18n").TFunction, fileExists: Function, dirExists: Function, readText: Function): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
export type ExportError = {
    /**
     * Name of the export check.
     */
    check: string;
    /**
     * Error key for i18n.
     */
    error: string;
};
import { AuditorModel } from '../AuditorModel.js';
