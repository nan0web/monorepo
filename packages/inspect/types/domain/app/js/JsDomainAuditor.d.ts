export class JsDomainAuditor extends DomainAuditor {
    /**
     * Checks constructor JSDoc for Partial<ModelOptions> or ModelAsAppOptions.
     * @param {string} classBody
     * @param {RegExpExecArray | null} ctorMatch
     * @param {string} className
     * @param {string} file
     * @param {import('@nan0web/i18n').TFunction} t
     * @returns {{ level: 'error' | 'warn', message: string } | null}
     */
    _checkModelOptionsJsDoc(classBody: string, ctorMatch: RegExpExecArray | null, className: string, file: string, t: import("@nan0web/i18n").TFunction): {
        level: "error" | "warn";
        message: string;
    } | null;
    /**
     * @param {string} dir
     * @param {string[]} [collected]
     * @returns {Promise<string[]>}
     */
    _collectJsFiles(dir: string, collected?: string[]): Promise<string[]>;
    /**
     * @param {import('../DomainAuditor.js').DomainError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     */
    checkPlatformDomain(errors: import("../DomainAuditor.js").DomainError[], t: import("@nan0web/i18n").TFunction): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, {
        domain: {
            violations: import("../DomainAuditor.js").DomainError[];
        };
    }, unknown>;
}
import { DomainAuditor } from '../DomainAuditor.js';
