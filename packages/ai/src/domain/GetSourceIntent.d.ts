import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * GetSourceIntent — OLMUI Intent for retrieving specific files from the workspace or remote registry.
 */
export declare class GetSourceIntent extends ModelAsApp {
    /** @type {string} */ version: string;
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static path: {
        help: string;
        type: string;
        required: boolean;
        positional: boolean;
    };
    static version: {
        help: string;
        type: string;
        alias: string;
        default: string;
    };
    /**
     * @param {Partial<GetSourceIntent> | Record<string, any>} [data] Initial state
     * @param {any} [options] Model options
     */
    constructor(data?: Partial<GetSourceIntent> | Record<string, any>, options?: any);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
