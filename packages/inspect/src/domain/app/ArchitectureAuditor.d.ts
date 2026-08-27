import { SnapshotAuditor } from '@nan0web/ui/inspect';
import { AuditorModel } from '../AuditorModel.js';
import { PhaseAuditor } from './PhaseAuditor.js';
import { CircularDependencyAuditor } from './CircularDependencyAuditor.js';
/**
 * ArchitectureAuditor — Orchestrates the full architectural audit pipeline.
 */
declare class ArchitectureAuditor extends AuditorModel {
    /** @type {string} Auditors to skip */ skip: string;
    static alias: string;
    static UI: {
        title: string;
        description: string;
        icon: string;
        db_unavailable: string;
        error_audit: string;
        error_auditor_class_alias: string;
        error_external_auditors: string;
        ok: string;
        fail: string;
        crashed: string;
        done: string;
        issues_found: string;
        starting: string;
        scan_failed: string;
        writing_report: string;
        report_written: string;
        report_title: string;
        report_intro: string;
        report_issues_title: string;
        report_subagents_title: string;
        report_failed: string;
    };
    static skip: {
        help: string;
        type: string;
        default: string;
    };
    static command: {
        help: string;
        options: (typeof CircularDependencyAuditor | typeof SnapshotAuditor | typeof PhaseAuditor)[];
        default: null;
    };
    static timeout: {
        help: string;
        type: string;
        default: number;
    };
    /**
     * @param {Partial<ArchitectureAuditor>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ArchitectureAuditor>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @param {string | typeof AuditorModel} key
     * @param {import('../AuditorModel.js').LanguagePlatform} [platform='js']
     * @returns {Promise<typeof AuditorModel | undefined>}
     */
    static getAuditorClass(key: string | typeof AuditorModel, platform?: import('../AuditorModel.js').LanguagePlatform): Promise<typeof AuditorModel | undefined>;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
export { ArchitectureAuditor };
