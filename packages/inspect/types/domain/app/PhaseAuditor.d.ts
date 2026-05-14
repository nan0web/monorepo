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
export class PhaseAuditor extends AuditorModel {
    /** @type {Object<string, string>} UI messages for audit steps */
    static UI: {
        [x: string]: string;
    };
    /**
     * Runs the phase and fundamentals audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
export type PhaseError = {
    file?: string | undefined;
    check?: string | undefined;
    error: string;
    boundary?: string[] | undefined;
    context?: string[] | undefined;
};
import { AuditorModel } from '../AuditorModel.js';
