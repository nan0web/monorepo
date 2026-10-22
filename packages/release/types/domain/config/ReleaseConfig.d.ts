/**
 * ReleaseConfig — Typed Configuration Model for @nan0web/release (Model-as-Schema v2).
 * Follows the 4-Tier Layered Configuration architecture:
 * 1. CLI Arguments & Flags (--releases-dir, etc.) [Priority 9]
 * 2. Environment Variables (RELEASE_DIR, RELEASE_CONFIG) [Priority 6]
 * 3. Configuration Files (release.config.{nan0,yaml,js}, package.json) [Priority 3]
 * 4. Hardcoded Defaults ('releases/') [Priority 0]
 */
export class ReleaseConfig extends Model {
    static alias: string;
    static releasesDir: {
        help: string;
        type: string;
        default: string;
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static rules: {
        help: string;
        type: string;
        default: {
            misplaced_backlog: string;
        };
        errorInvalid: string;
        validate: (val: any) => any;
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
     * Cascading loader for ReleaseConfig using @nan0web/db.
     * Resolution priority:
     * 1. Global: ~/.nan0web/release/config.{nan0,yaml,js}
     * 2. Repo root: <repo_root>/release.config.{nan0,yaml,js}
     * 3. Project: <target_dir>/release.config.{nan0,yaml,js} or package.json#release
     * 4. Env: process.env.RELEASE_DIR
     *
     * @param {import('@nan0web/db').DB | any} db Injected database instance
     * @param {string} [targetDir='.'] Target directory being audited
     * @param {Partial<ReleaseConfig>} [cliOverrides={}] Explicit CLI arguments
     * @returns {Promise<ReleaseConfig>} Resolved and merged ReleaseConfig
     */
    static load(db: import("@nan0web/db").DB | any, targetDir?: string, cliOverrides?: Partial<ReleaseConfig>): Promise<ReleaseConfig>;
    /**
     * @param {Partial<ReleaseConfig> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseConfig> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Target directory for releases */
    releasesDir: string;
    /** @type {Record<string, string>} Rule enforcement levels */
    rules: Record<string, string>;
}
import { Model } from '@nan0web/types';
