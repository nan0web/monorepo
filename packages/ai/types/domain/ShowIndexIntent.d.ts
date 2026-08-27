import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * ShowIndexIntent — Intent to display metadata about indexed workspace packages.
 */
export declare class ShowIndexIntent extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static project: {
        help: string;
        type: string;
        alias: string;
        default: any;
        positional: boolean;
    };
    static scope: {
        help: string;
        type: string;
        alias: string;
        options: string[];
        default: any;
    };
    static json: {
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * @param {Partial<ShowIndexIntent> | Record<string, any>} [data] Initial state
     * @param {any} [options] Model options
     */
    constructor(data?: Partial<ShowIndexIntent> | Record<string, any>, options?: any);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
