/**
 * CircularDependencyAuditor — Detects circular dependencies using Madge.
 */
export class CircularDependencyAuditor extends AuditorModel {
    static UI: {
        title: string;
        description: string;
        icon: string;
        lookingIn: string;
        noCycles: string;
        foundCycles: string;
        errorDb: string;
        errorTimeout: string;
    };
    /**
     * @param {Partial<CircularDependencyAuditor>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<CircularDependencyAuditor>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {number} Timeout to cancel */ timeout: number;
    /**
     * Runs the circular dependency audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
    /**
     * @param {string} scanPath
     * @param {number} timeout
     * @returns {Promise<any>}
     */
    _runMadgeAsync(scanPath: string, timeout: number): Promise<any>;
    /**
     * @param {string} path
     * @param {any} options
     * @returns {any}
     */
    fork(path: string, options: any): any;
}
import { AuditorModel } from '../AuditorModel.js';
