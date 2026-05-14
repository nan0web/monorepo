/**
 * Model-as-Schema for global LLiMo execution config
 *
 * @property {boolean} debug Verbose console logging output
 * @property {string} provider The default LLM inference provider (e.g. cerebras, openrouter)
 * @property {string} dbPath Base path where chats data and indices are stored
 * @property {number} maxTotalBudget A hard limit on total USD spent across all AI calls
 */
export class LLiMoConfigModel extends Model {
    static debug: {
        help: string;
        default: boolean;
        type: string;
    };
    static provider: {
        help: string;
        alias: string;
        default: string;
        type: string;
    };
    static dbPath: {
        help: string;
        alias: string;
        default: string;
        type: string;
    };
    static maxTotalBudget: {
        help: string;
        alias: string;
        default: number;
        type: string;
        validate: (val: any) => string | true;
    };
    static UI: {
        err_budget: string;
    };
    /**
     * @param {Partial<LLiMoConfigModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<LLiMoConfigModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {boolean} Verbose console logging output */ debug: boolean;
    /** @type {string} The default LLM inference provider (e.g. cerebras, openrouter) */ provider: string;
    /** @type {string} Base path where chats data and indices are stored */ _dbPath: string;
    /** @type {number} A hard limit on total USD spent across all AI calls */ maxTotalBudget: number;
}
import { Model } from '@nan0web/types';
