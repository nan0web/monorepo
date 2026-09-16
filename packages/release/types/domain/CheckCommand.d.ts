/**
 * @typedef {Object} DiagnosticItem
 * @property {'error' | 'warning' | 'info'} level
 * @property {string} code
 * @property {string} project
 * @property {string} message
 * @property {string} file
 * @property {string} fix
 */
/**
 * CheckCommand - PM-as-Code Release Structure & Compliance Validator.
 */
export class CheckCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        errorDbRequired: string;
        title: string;
        header: string;
        scanningCount: string;
        projectHeader: string;
        missingPackageJson: string;
        packageJsonValid: string;
        noReleasesDir: string;
        releasesDirFound: string;
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
        recommendationsHeader: string;
        recommendationItem: string;
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
        };
    };
    static target: {
        help: string;
        default: string;
        type: string;
        positional: boolean;
    };
    static registryFile: {
        help: string;
        default: string;
        type: string;
        alias: string;
    };
    static all: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    /**
     * @param {Partial<CheckCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<CheckCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */ target: string;
    /** @type {string} */ registryFile: string;
    /** @type {boolean} */ all: boolean;
    /**
     * Execute release structure check
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { success: boolean, diagnostics: DiagnosticItem[], checkedProjects: any[] }, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, {
        success: boolean;
        diagnostics: DiagnosticItem[];
        checkedProjects: any[];
    }, any>;
    #private;
}
export default CheckCommand;
export type DiagnosticItem = {
    level: "error" | "warning" | "info";
    code: string;
    project: string;
    message: string;
    file: string;
    fix: string;
};
import { ModelAsApp } from '@nan0web/ui';
