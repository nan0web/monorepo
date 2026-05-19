/**
 * JsIntentAuditor — Specialized auditor for JS/TS output hygiene.
 */
export class JsIntentAuditor extends AuditorModel {
    /** @type {string[]} Directories to ignore during scanning */
    static IGNORE_DIRS: string[];
    /**
     * Checks if a directory or file should be ignored.
     * @param {string} name
     * @returns {boolean}
     */
    static isIgnored(name: string): boolean;
    /**
     * Inspects file content for console.* or process.* writes.
     * @param {string} content Content of the file.
     * @param {import('@nan0web/i18n').TFunction} t Translate function.
     * @returns {string[]} List of error messages.
     */
    static inspectFileContent(content: string, t: import("@nan0web/i18n").TFunction): string[];
}
export default JsIntentAuditor;
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
