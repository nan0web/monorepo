/**
 * @typedef {Object} ThemingConfig
 * @property {string[]} [ignorePatterns] Regex or string patterns to ignore in theming audit.
 * @property {string[]} [ignoreDirs] Directory names to ignore during theming scan.
 */
/**
 * @typedef {Object} SnapshotsConfig
 * @property {boolean} [optional] Allow audit to pass if snapshots directory does not exist.
 * @property {boolean} [allowEmpty] Allow audit to pass if no snapshots are found.
 * @property {string} [dir] Target snapshots directory (default: 'snapshots/core').
 */
/**
 * InspectConfig — Typed Configuration Model for @nan0web/inspect (Model-as-Schema v2).
 */
export class InspectConfig extends Model {
    static include: {
        help: string;
        type: string;
        default: any[];
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static skip: {
        help: string;
        type: string;
        default: any[];
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static modules: {
        help: string;
        type: string;
        default: {};
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static theming: {
        help: string;
        type: string;
        default: {
            ignorePatterns: any[];
            ignoreDirs: any[];
        };
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static snapshots: {
        help: string;
        type: string;
        default: {
            optional: boolean;
            allowEmpty: boolean;
            dir: string;
        };
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static rules: {
        help: string;
        type: string;
        default: {};
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    /**
     * Parses raw configuration content depending on extension.
     * @param {string} raw
     * @param {string} ext
     * @returns {Record<string, any>}
     * @private
     */
    private static _parseRaw;
    /**
     * Cascading loader for InspectConfig using @nan0web/db.
     * Resolution priority:
     * 1. Global: ~/.nan0web/inspect/config.nan0
     * 2. Repo root: <repo_root>/inspect.config.{nan0,yaml,js}
     * 3. Project: <target_dir>/inspect.config.{nan0,yaml,js}
     *
     * Merges configurations without procedural fs calls.
     *
     * @param {import('@nan0web/db').DB | any} db Injected database instance
     * @param {string} [targetDir='.'] Target directory being audited
     * @returns {Promise<InspectConfig>} Resolved and merged InspectConfig
     */
    static load(db: import("@nan0web/db").DB | any, targetDir?: string): Promise<InspectConfig>;
    /**
     * @param {Partial<InspectConfig> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<InspectConfig> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string[]} Whitelist of auditor aliases to run exclusively */
    include: string[];
    /** @type {string[]} Auditor aliases to skip */
    skip: string[];
    /** @type {Record<string, any>} Module-specific configurations */
    modules: Record<string, any>;
    /** @type {ThemingConfig} Theming options */
    theming: ThemingConfig;
    /** @type {SnapshotsConfig} Snapshots options */
    snapshots: SnapshotsConfig;
    /** @type {Record<string, boolean>} Granular rule flags */
    rules: Record<string, boolean>;
}
export type ThemingConfig = {
    /**
     * Regex or string patterns to ignore in theming audit.
     */
    ignorePatterns?: string[];
    /**
     * Directory names to ignore during theming scan.
     */
    ignoreDirs?: string[];
};
export type SnapshotsConfig = {
    /**
     * Allow audit to pass if snapshots directory does not exist.
     */
    optional?: boolean;
    /**
     * Allow audit to pass if no snapshots are found.
     */
    allowEmpty?: boolean;
    /**
     * Target snapshots directory (default: 'snapshots/core').
     */
    dir?: string;
};
import { Model } from '@nan0web/types';
