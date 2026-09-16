/**
 * SeedModel - Universal Subcommand to seed DB-FS data into Payload CMS
 * @extends {PayloadApp}
 */
export class SeedModel extends PayloadApp {
    static alias: string;
    static UI: {
        title: string;
        start: string;
        scanning: string;
        loading: string;
        seeded: string;
        done: string;
        errorDb: string;
    };
    static dataDir: {
        help: string;
        default: string;
        positional: boolean;
    };
    static output: {
        help: string;
        default: string;
        alias: string;
    };
    /**
     * @param {Partial<SeedModel>} [data={}]
     * @param {Partial<import('./PayloadApp.js').PayloadAppOptions>} [options={}]
     */
    constructor(data?: Partial<SeedModel>, options?: Partial<import("./PayloadApp.js").PayloadAppOptions>);
    /** @type {string} Target directory containing SSOT data files */ dataDir: string;
    /** @type {string} Output path */ output: string;
    /**
     * Reads seed files via DB instance.
     * @param {string} target
     * @returns {Promise<string[]>}
     */
    readSeedFiles(target: string): Promise<string[]>;
    /**
     * Dynamically resolves collection slug from document metadata or URI structure.
     * @param {string} uri
     * @param {any} [doc]
     * @returns {string}
     */
    resolveCollectionSlug(uri: string, doc?: any): string;
    /**
     * Base default normalization for DB-FS records.
     * Can be overridden by domain-specific SeedModels (e.g. CardSeedModel, BankSeedModel).
     * @param {any} rawRecord
     * @returns {Object}
     */
    normalizeRecord(rawRecord: any): any;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, import('@nan0web/ui/core').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui/core").Intent, import("@nan0web/ui/core").ResultIntent, any>;
}
import { PayloadApp } from './PayloadApp.js';
