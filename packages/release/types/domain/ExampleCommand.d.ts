/**
 * ExampleCommand - Display or generate canonical release template files
 */
export default class ExampleCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        help: string;
    };
    static version: {
        help: string;
        default: string;
    };
    static file: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<ExampleCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ExampleCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */ version: string;
    /** @type {'all' | 'task' | 'user' | 'spec'} */ file: "all" | "task" | "user" | "spec";
    /**
     * Build canonical release template strings
     * @param {string} [ver]
     */
    getTemplate(ver?: string): {
        version: string;
        major: string;
        minor: string;
        taskMd: string;
        userMd: string;
        taskSpecJs: string;
    };
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '@nan0web/ui';
