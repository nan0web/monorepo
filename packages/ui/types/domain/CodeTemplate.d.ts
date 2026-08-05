export class CodeTemplate extends ModelAsApp {
    static UI: {
        errorDb: string;
    };
    static input: {
        help: string;
        type: string;
        default: {};
    };
    static template: {
        help: string;
        default: string;
    };
    static templateFile: {
        help: string;
        default: string;
    };
    static prefix: {
        help: string;
        type: string;
        default: string;
    };
    static suffix: {
        help: string;
        type: string;
        default: string;
    };
    /**
     * @param {Partial<CodeTemplate>} [data]
     * @param {Partial<import('./ModelAsApp.js').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<CodeTemplate>, options?: Partial<import("./ModelAsApp.js").ModelAsAppOptions>);
    /** @type {Record<string, string>} Input data for the replacement in template */ input: Record<string, string>;
    /** @type {string} Template content */ template: string;
    /** @type {string} Template filename */ templateFile: string;
    /** @type {string} Prefix for replacement tags */ prefix: string;
    /** @type {string} Suffix for replacement tags */ suffix: string;
    /**
     * @param {string} [prefix=this.prefix]
     * @param {string} [suffix=this.suffix]
     * @returns {Promise<string>}
     */
    readTemplate(prefix?: string, suffix?: string): Promise<string>;
}
import { ModelAsApp } from './ModelAsApp.js';
