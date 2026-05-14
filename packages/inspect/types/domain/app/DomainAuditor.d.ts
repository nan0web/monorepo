/**
 * @typedef {Object} DomainError
 * @property {string} file File where the violation was found.
 * @property {string} error Error key for i18n.
 */
/**
 * DomainAuditor — Enforces Model-as-Schema strictness and domain isolation.
 */
export class DomainAuditor extends AuditorModel {
    /** @type {Object<string, string>} UI messages for domain steps */
    static UI: {
        [x: string]: string;
    };
    /**
     * Runs the domain strictness audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
    /**
     * @abstract
     * @param {DomainError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    checkPlatformDomain(errors: DomainError[], t: import("@nan0web/i18n").TFunction): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
export type DomainError = {
    /**
     * File where the violation was found.
     */
    file: string;
    /**
     * Error key for i18n.
     */
    error: string;
};
import { AuditorModel } from '../AuditorModel.js';
