/**
 * @typedef {Object} ReleaseDiagnostic
 * @property {'error' | 'warning' | 'info'} level
 * @property {string} code
 * @property {string} [check]
 * @property {string} [file]
 * @property {string} error
 * @property {string} [suggestion]
 * @property {string} [fix]
 */
/**
 * ReleaseAuditor — Architecture auditor and validator for PM-as-Code release structures.
 */
export class ReleaseAuditor extends AuditorModel {
    static changed: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    static all: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    static registryFile: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static UI: {
        title: string;
        header: string;
        skipped: string;
        missingPackageJson: string;
        noReleasesDir: string;
        releasesFound: string;
        releaseHeader: string;
        releaseDocCompleted: string;
        missingReleaseDoc: string;
        missingUserDoc: string;
        incompleteUserMetrics: string;
        userMetricsValid: string;
        ambiguousContracts: string;
        missingContract: string;
        activeContractWip: string;
        sealedRegressionClosed: string;
        orphanFile: string;
        summary: string;
        Diagnostics: {
            MISSING_PACKAGE_JSON: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            MISSING_RELEASES_DIR: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            MISSING_RELEASE_MD: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            MISSING_USER_MD: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            INCOMPLETE_USER_METRICS: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            AMBIGUOUS_CONTRACTS: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            MISSING_CONTRACT: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            ORPHAN_RELEASE_FILE: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
            PROCEDURAL_RELEASE_ARTIFACT: {
                level: string;
                code: string;
                message: string;
                fix: string;
            };
        };
    };
    /**
     * @param {Partial<ReleaseAuditor> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseAuditor> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {boolean} */ changed: boolean;
    /** @type {boolean} */ all: boolean;
    /** @type {string} */ registryFile: string;
    /**
     * Runs the PM-as-Code release audit.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
    #private;
}
export default ReleaseAuditor;
export type ReleaseDiagnostic = {
    level: "error" | "warning" | "info";
    code: string;
    check?: string | undefined;
    file?: string | undefined;
    error: string;
    suggestion?: string | undefined;
    fix?: string | undefined;
};
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
