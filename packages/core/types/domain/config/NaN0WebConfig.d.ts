/**
 * Unified NaN0Web configuration contract (Model-as-Schema) for nan0web.nan0.
 * Combines CoCoDev 7-step config, package agents, and nan0web.app runtime settings.
 */
export default class NaN0WebConfig extends Model {
    static title: {
        alias: string;
        help: string;
        default: string;
    };
    static appName: {
        alias: string;
        help: string;
        placeholder: string;
        default: string;
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
    static aliases: {
        help: string;
        type: string;
        default: {};
        hidden: boolean;
    };
    static directoryIndex: {
        help: string;
        placeholder: string;
        default: string;
    };
    static ui: {
        help: string;
        type: string;
        default: never[];
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
        default: {};
        hidden: boolean;
    };
    static apps: {
        help: string;
        type: string;
        hidden: boolean;
        default: never[];
    };
    static agents: {
        help: string;
        type: string;
        hint: typeof AgentEntryConfig;
        default: never[];
    };
    static steps: {
        help: string;
        type: string;
        hint: typeof StepsConfig;
        default: {};
    };
    /**
     * Loads and merges cascading nan0web.nan0 layers from a @nan0web/db instance.
     * @param {import('@nan0web/db').default} db
     * @param {{ layers?: string[] }} [options]
     * @returns {Promise<NaN0WebConfig>}
     */
    static load(db: import("@nan0web/db").default, options?: {
        layers?: string[];
    }): Promise<NaN0WebConfig>;
    /**
     * @param {Partial<NaN0WebConfig>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<NaN0WebConfig>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Package or workspace name */
    title: string;
    /** @type {string} Project name */
    appName: string;
    /** @type {string} Data Source Name (folder or connection string) */
    dsn: string;
    /** @type {string} Default locale */
    locale: string;
    /** @type {number} Server port */
    port: number;
    /** @type {string} UI theme (light | dark | auto) */
    theme: string;
    /** @type {Record<string, string>} Virtual URI aliases (source -> target) */
    aliases: Record<string, string>;
    /** @type {string} Directory index file name (index or README for git repos) */
    directoryIndex: string;
    /** @type {string[]} UI adapters to load */
    ui: string[];
    /** @type {object | null} TLS/SSL config for HTTPS — certificate and key paths */
    ssl: object | null;
    /** @type {Record<string, any>} Configuration for access and error logs */
    log: Record<string, any>;
    /** @type {Array<Record<string, any>>} Installed domain apps */
    apps: Array<Record<string, any>>;
    /** @type {AgentEntryConfig[]} Configured AI agents and their workflows/inspectors */
    agents: AgentEntryConfig[];
    /** @type {StepsConfig} CoCoDev 7-step configuration */
    steps: StepsConfig;
}
import { Model } from '@nan0web/types';
import AgentEntryConfig from './AgentEntryConfig.js';
import StepsConfig from './StepsConfig.js';
