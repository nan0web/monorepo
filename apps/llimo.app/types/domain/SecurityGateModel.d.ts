/**
 * SecurityGateModel - Enforces security policies for LLiMo workflow commands.
 * Blocks dangerous bash commands, sudo/eval, and unregistered proxies.
 */
export class SecurityGateModel extends Model {
    static allowedProxies: {
        help: string;
        default: string[];
        type: string;
        validate: (val: any) => string | true;
    };
    static forbiddenPatterns: {
        help: string;
        default: string[];
        type: string;
    };
    static UI: {
        errorBlockedPattern: string;
        errorUnregisteredProxy: string;
        errNoProxies: string;
    };
    /**
     * Validates a command and its arguments.
     *
     * @param {string} proxy
     * @param {string[]} args
     * @returns {true | string} True if ok, or error message $key
     */
    static validate(proxy: string, args: string[]): true | string;
    constructor(data?: {});
    /** @type {any[]} Allowed proxies list */ allowedProxies: any[];
    /** @type {any} Forbidden string patterns or regexes */ forbiddenPatterns: any;
}
import { Model } from '@nan0web/types';
