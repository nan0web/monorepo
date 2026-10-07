/**
 * OlmuiThemingAuditor — Auditor for OLMUI theming standard compliance.
 * Polymorphically delegates execution to JS or Python subclasses.
 */
export class OlmuiThemingAuditor extends AuditorModel {
    /** @type {string[]} Directories to ignore during scanning */
    static IGNORE_DIRS: string[];
    /** @type {(string | RegExp)[]} Files or paths to ignore (e.g. Payload CMS / admin components, tests, setup) */
    static IGNORE_PATTERNS: (string | RegExp)[];
    /**
     * Checks if a directory or file path should be ignored by theming audit.
     * @param {string} path
     * @returns {boolean}
     */
    static isIgnored(path: string): boolean;
    static UI: {
        title: string;
        description: string;
        icon: string;
        starting: string;
        noFiles: string;
        doneSuccess: string;
        doneErrors: string;
        auditPassed: string;
        auditFailed: string;
        errorDb: string;
        errorColor: string;
        errorSize: string;
    };
}
export default OlmuiThemingAuditor;
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
