import { ModelAsApp } from './ModelAsApp.js';
export declare class CodeTemplate extends ModelAsApp {
    template: any;
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
    constructor(data?: Partial<CodeTemplate>, options?: Partial<import('./ModelAsApp.js').ModelAsAppOptions>);
    /**
     * @param {string} [prefix=this.prefix]
     * @param {string} [suffix=this.suffix]
     * @returns {Promise<string>}
     */
    readTemplate(prefix?: string, suffix?: string): Promise<string>;
    /**
     * Compiles input data into template
     * @throws {Error} If no database available.
     * @returns {AsyncGenerator<import('../core/Intent.js').Intent, import('../core/Intent.js').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('../core/Intent.js').Intent, import('../core/Intent.js').ResultIntent, any>;
}
