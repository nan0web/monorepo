/**
 * PyIntentAuditor — Specialized auditor for Python output hygiene.
 */
export class PyIntentAuditor extends AuditorModel {
    /** @type {string[]} Directories to ignore during scanning */
    static IGNORE_DIRS: string[];
    /**
     * Checks if a directory or file should be ignored.
     * @param {string} name
     * @returns {boolean}
     */
    static isIgnored(name: string): boolean;
    /**
     * Inspects Python file content for print or sys.stdout/stderr writes.
     * @param {string} content Content of the file.
     * @param {import('@nan0web/i18n').TFunction} t Translate function.
     * @returns {string[]} List of error messages.
     */
    static inspectFileContent(content: string, t: import("@nan0web/i18n").TFunction): string[];
}
export default PyIntentAuditor;
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
