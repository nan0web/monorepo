/**
 * @property {string} source Glob pattern for source files
 * @property {string} target Target directory for translated files
 * @property {string} from Source language code
 * @property {string} to Target language code
 * @property {boolean} quiet Quiet mode (suppress logs and progress)
 */
export class TranslateDocsModel extends Model {
    static source: {
        help: string;
        default: string;
        positional: boolean;
    };
    static target: {
        help: string;
        default: string;
        positional: boolean;
    };
    static from: {
        help: string;
        default: string;
    };
    static to: {
        help: string;
        default: string;
    };
    static quiet: {
        help: string;
        default: boolean;
        alias: string;
        type: string;
    };
    /**
     * @param {Partial<TranslateDocsModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<TranslateDocsModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {any} Glob pattern for source files */ source: any;
    /** @type {any} Target directory for translated files */ target: any;
    /** @type {any} Source language code */ from: any;
    /** @type {any} Target language code */ to: any;
    /** @type {boolean} Quiet mode (suppress logs and progress) */ quiet: boolean;
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
        data: {
            translatedCount: number;
            totalDuration: number;
            totalBudget: number;
        };
        level?: undefined;
        message?: undefined;
    }, {
        status: string;
        reason: string;
        data?: undefined;
    } | {
        status: string;
        data: {
            translatedCount: number;
            totalBudget: number;
        };
        reason?: undefined;
    }, unknown>;
}
import { Model } from '@nan0web/types';
