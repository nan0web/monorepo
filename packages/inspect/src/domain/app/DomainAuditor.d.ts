import { AuditorModel } from '../AuditorModel.js';
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
/**
 * @typedef {Object} DomainError
 * @property {string} file File where the violation was found.
 * @property {string} error Error key for i18n.
 */
/**
 * DomainAuditor — Enforces Model-as-Schema strictness and domain isolation.
 */
export declare class DomainAuditor extends AuditorModel {
    static alias: string;
    /** @type {Object<string, string>} UI messages for domain steps */
    static UI: Record<string, string>;
    /**
     * Runs the domain strictness audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, any, any>;
    /**
     * @abstract
     * @param {DomainError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    checkPlatformDomain(errors: DomainError[], t: import('@nan0web/i18n').TFunction): AsyncGenerator<import('@nan0web/ui').Intent, any, any>;
}
