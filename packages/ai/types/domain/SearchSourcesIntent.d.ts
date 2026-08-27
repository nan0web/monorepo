import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * SearchSourcesIntent — OLMUI Intent for semantic search across workspace indices.
 */
export declare class SearchSourcesIntent extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static query: {
        help: string;
        type: string;
        required: boolean;
        positional: boolean;
    };
    static project: {
        help: string;
        type: string;
        alias: string;
        default: any;
    };
    static limit: {
        help: string;
        type: string;
        alias: string;
        default: number;
    };
    static maxDistance: {
        help: string;
        type: string;
        alias: string;
        default: number;
    };
    static scope: {
        help: string;
        type: string;
        alias: string;
        options: string[];
        default: string;
    };
    static strictSearch: {
        alias: string;
        help: string;
        type: string;
        default: boolean;
    };
    static json: {
        help: string;
        type: string;
        default: boolean;
    };
    static sources: {
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * @param {Partial<SearchSourcesIntent> | Record<string, any>} [data] Initial state
     * @param {any} [options] Model options
     */
    constructor(data?: Partial<SearchSourcesIntent> | Record<string, any>, options?: any);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
