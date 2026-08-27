import { AuditorModel } from '../AuditorModel.js';
export type PhaseError = {
    file?: string;
    check?: string;
    error: string;
    boundary?: string[];
    context?: string[];
};
/**
 * @typedef {Object} PhaseError
 * @property {string} [file]
 * @property {string} [check]
 * @property {string} error
 * @property {string[]} [boundary]
 * @property {string[]} [context]
 */
/**
 * PhaseAuditor — Verifies project lifecycle phase and fundamental system files.
 */
export declare class PhaseAuditor extends AuditorModel {
    static alias: string;
    /** @type {Object<string, string>} UI messages for audit steps */
    static UI: Record<string, string>;
    /**
     * Runs the phase and fundamentals audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, any, any>;
}
