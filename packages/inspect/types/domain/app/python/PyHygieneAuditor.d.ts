export class PyHygieneAuditor extends HygieneAuditor {
    /**
     * @param {import('../HygieneAuditor.js').HygieneError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     */
    checkPlatformHygiene(errors: import("../HygieneAuditor.js").HygieneError[], t: import("@nan0web/i18n").TFunction): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, void, unknown>;
}
import { HygieneAuditor } from '../HygieneAuditor.js';
