export class PyDomainAuditor extends DomainAuditor {
    /**
     * @param {import('../DomainAuditor.js').DomainError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     */
    checkPlatformDomain(errors: import("../DomainAuditor.js").DomainError[], t: import("@nan0web/i18n").TFunction): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, void, unknown>;
}
import { DomainAuditor } from '../DomainAuditor.js';
