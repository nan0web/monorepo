/**
 * ArchitectureAuditor — Orchestrates the full architectural audit pipeline.
 */
export class ArchitectureAuditor extends AuditorModel {
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
        options: (typeof SnapshotAuditor | typeof PhaseAuditor | typeof CircularDependencyAuditor)[];
        default: null;
    };
    static timeout: {
        help: string;
        default: number;
    };
    /**
     * @param {string | typeof AuditorModel} key
     * @param {import('../AuditorModel.js').LanguagePlatform} [platform='js']
     * @returns {Promise<typeof AuditorModel | undefined>}
     */
    static getAuditorClass(key: string | typeof AuditorModel, platform?: import("../AuditorModel.js").LanguagePlatform): Promise<typeof AuditorModel | undefined>;
    /**
     * @param {Partial<ArchitectureAuditor>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ArchitectureAuditor>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Auditors to skip */ skip: string;
    /** @type {typeof AuditorModel | null} Current command */ command: typeof AuditorModel | null;
    /** @type {number} Timeout for audit */ timeout: number;
}
import { AuditorModel } from '../AuditorModel.js';
import { SnapshotAuditor } from '@nan0web/ui/inspect';
import { PhaseAuditor } from './PhaseAuditor.js';
import { CircularDependencyAuditor } from './CircularDependencyAuditor.js';
