/**
 * NaN0WebApp Domain Model & Sovereign Runner Configuration.
 *
 * Extends ModelAsApp to provide declarative lifecycle run/build orchestrator schemas.
 *
 * @property {string} appName Project name
 * @property {string} dsn Data Source Name (folder or connection string)
 * @property {string} locale Default locale
 * @property {number} port Server port
 * @property {'light' | 'dark' | 'auto'} theme UI theme
 * @property {{ cert: string, key: string }|null} ssl TLS/SSL configuration for HTTPS (cert and key paths)
 * @property {LogConfig} log Logging configuration settings
 * @property {AppEntryConfig[]} apps Array of installed domain apps
 * @property {Record<string, string>} aliases Virtual URI projections
 * @property {string[]} ui Active UI adapters (e.g. ['cli', 'web'])
 * @property {string} build Target platform for static build
 * @property {string} outDir Output directory for build artifacts
 * @property {string} operation Selected operation (run or build)
 */
export default class NaN0WebApp extends ModelAsApp {
    static UI: {
        title: string;
        initDb: string;
        createAliases: string;
        detectLocale: string;
        attachApps: string;
        dbSeal: string;
        askOperation: string;
        running: string;
        building: string;
        success: string;
    };
    static appName: {
        alias: string;
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
        validate: (val: any) => true | "AppName is required";
    };
    static dsn: {
        help: string;
        placeholder: string;
        default: string;
    };
    static locale: {
        help: string;
        placeholder: string;
        default: string;
    };
    static port: {
        help: string;
        placeholder: string;
        default: number;
    };
    static theme: {
        help: string;
        placeholder: string;
        default: string;
    };
    static ssl: {
        help: string;
        type: string;
        default: null;
        hidden: boolean;
    };
    static log: {
        help: string;
        type: string;
        hint: typeof LogConfig;
        default: {};
        hidden: boolean;
    };
    static apps: {
        help: string;
        type: string;
        hint: typeof AppEntryConfig;
        hidden: boolean;
        default: never[];
    };
    static aliases: {
        help: string;
        type: string;
        default: {};
        hidden: boolean;
    };
    static ui: {
        help: string;
        type: string;
        default: never[];
    };
    static build: {
        help: string;
        type: string;
        default: string;
    };
    static outDir: {
        help: string;
        type: string;
        default: string;
    };
    static operation: {
        help: string;
        type: string;
        default: string;
        options: {
            value: string;
            label: string;
        }[];
    };
    /**
     * @param {object} input
     * @returns {NaN0WebApp}
     */
    static from(input: object): NaN0WebApp;
    /**
     * @param {Partial<NaN0WebApp>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<NaN0WebApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */ appName: string;
    /** @type {string} */ dsn: string;
    /** @type {string} */ locale: string;
    /** @type {number} */ port: number;
    /** @type {string} */ theme: string;
    /** @type {{ cert: string, key: string }|null} */ ssl: {
        cert: string;
        key: string;
    } | null;
    /** @type {LogConfig} */ log: LogConfig;
    /** @type {AppEntryConfig[]} */ apps: AppEntryConfig[];
    /** @type {Record<string, string>} */ aliases: Record<string, string>;
    /** @type {string[]} */ ui: string[];
    /** @type {string} */ build: string;
    /** @type {string} */ outDir: string;
    /** @type {string} */ operation: string;
}
import { ModelAsApp } from '@nan0web/ui';
import LogConfig from './LogConfig.js';
import AppEntryConfig from './AppEntryConfig.js';
