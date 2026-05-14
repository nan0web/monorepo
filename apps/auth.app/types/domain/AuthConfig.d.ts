/**
 * AuthConfig — Model-as-Schema for Authentication System Settings.
 * Defines the operational environment for AuthApp.
 */
export class AuthConfig extends Model {
    static UI: {
        title: string;
        description: string;
        icon: string;
    };
    static passwordMinLength: {
        alias: string;
        help: string;
        type: string;
        default: number;
        validate: (v: any) => true | "Password length should be at least 4 chars";
    };
    static allowPublicSignup: {
        alias: string;
        help: string;
        type: string;
        default: boolean;
    };
    static clearTokensOnPasswordReset: {
        alias: string;
        help: string;
        type: string;
        default: boolean;
    };
    static tokenExpiry: {
        alias: string;
        help: string;
        type: string;
        default: string;
    };
    static defaultCommunityCoins: {
        alias: string;
        help: string;
        type: string;
        default: number;
    };
    /**
     * @param {Partial<AuthConfig> | Record<string, any>} [data]
     * @param {object} [options]
     */
    constructor(data?: Partial<AuthConfig> | Record<string, any>, options?: object);
    /** @type {number} */ passwordMinLength: number;
    /** @type {boolean} */ allowPublicSignup: boolean;
    /** @type {boolean} */ clearTokensOnPasswordReset: boolean;
    /** @type {string} */ tokenExpiry: string;
    /** @type {number} */ defaultCommunityCoins: number;
}
import { Model } from '@nan0web/types';
