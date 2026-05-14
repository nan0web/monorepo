/** @typedef {'js' | 'python' | 'unknown'} LanguagePlatform */
/**
 * @typedef {Object} AuditorError
 * @property {string} [file] Target file where the error occurred
 * @property {string} [check] Logical check identifier (e.g. scripts.test)
 * @property {string} error Human-readable error description
 * @property {string} [suggestion] Optional code snippet or command to fix the issue
 * @property {string[]} [boundary] Files that must be modified to fix the issue
 * @property {string[]} [context] Files needed as context to understand the fix
 */
/**
 * AuditorModel — Base model for all architecture auditors.
 */
export class AuditorModel extends ModelAsApp {
    static alias: string;
    static dir: {
        help: string;
        type: string;
        default: string;
        positional: boolean;
    };
    static fix: {
        help: string;
        default: boolean;
        type: string;
    };
    static platform: {
        help: string;
        options: string[];
        default: string;
    };
    static timeout: {
        help: string;
        type: string;
        default: number;
    };
    /**
     * @param {Partial<AuditorModel> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<AuditorModel> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Target directory to audit */ dir: string;
    /** @type {LanguagePlatform} Language platform to audit */ platform: LanguagePlatform;
    /** @type {boolean} Automatically apply fixes where possible */ fix: boolean;
    /**
     * Initializes the auditor by detecting a platform if were not specified at construction.
     */
    init(): Promise<void>;
    /**
     * Check if a file exists in the target directory.
     * @param {string} rel - Relative path to the file.
     * @returns {Promise<boolean>}
     */
    fileExists(rel: string): Promise<boolean>;
    /**
     * Check if a directory exists in the target directory.
     * @param {string} rel - Relative path to the directory.
     * @returns {Promise<boolean>}
     */
    dirExists(rel: string): Promise<boolean>;
    #private;
}
export type LanguagePlatform = "js" | "python" | "unknown";
export type AuditorError = {
    /**
     * Target file where the error occurred
     */
    file?: string | undefined;
    /**
     * Logical check identifier (e.g. scripts.test)
     */
    check?: string | undefined;
    /**
     * Human-readable error description
     */
    error: string;
    /**
     * Optional code snippet or command to fix the issue
     */
    suggestion?: string | undefined;
    /**
     * Files that must be modified to fix the issue
     */
    boundary?: string[] | undefined;
    /**
     * Files needed as context to understand the fix
     */
    context?: string[] | undefined;
};
import { ModelAsApp } from '@nan0web/ui';
