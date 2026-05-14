/**
 * Web Shopper Model - Autonomous B2B Agent to aggregate prices
 *
 * @property {string} query What needs to be bought (e.g. "шредер для гілок та електропила")
 * @property {boolean} quiet Quiet mode
 */
export class WebShopperModel extends Model {
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
    static UI: {
        errorMissingQuery: string;
        errorModelsFailed: string;
        errorLoopLimit: string;
        progressAnalysis: string;
        progressThinking: string;
        progressSearching: string;
        progressReading: string;
        warnHallucination: string;
    };
    /**
     * @param {Partial<WebShopperModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<WebShopperModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {any} Shopping query describing what to buy */ query: any;
    /** @type {boolean} Quiet mode */ quiet: boolean;
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: any;
        data?: undefined;
    } | {
        type: string;
        message: any;
        level?: undefined;
        data?: undefined;
    } | {
        type: string;
        data: string;
        level?: undefined;
        message?: undefined;
    }, {
        success: boolean;
    }, unknown>;
}
import { Model } from '@nan0web/types';
