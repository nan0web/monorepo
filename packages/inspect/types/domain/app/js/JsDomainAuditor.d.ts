export class JsDomainAuditor extends DomainAuditor {
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
