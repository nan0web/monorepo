/**
 * llimo search — A research agent that performs a web search, reads the top 3 results, and compiles an answer.
 *
 * @property {string} query Search query to investigate
 * @property {boolean} quiet Quiet mode
 */
export class SearchWebModel extends Model {
    static query: {
        help: string;
        default: string;
        positional: boolean;
    };
    static quiet: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    /**
     * @param {Partial<SearchWebModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<SearchWebModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {any} Search query to investigate */ query: any;
    /** @type {boolean} Quiet mode */ quiet: boolean;
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
        data?: undefined;
    } | {
        type: string;
        message: string;
        level?: undefined;
        data?: undefined;
    } | {
        type: string;
        data: any;
        level?: undefined;
        message?: undefined;
    }, {
        success: boolean;
    }, unknown>;
}
import { Model } from '@nan0web/types';
