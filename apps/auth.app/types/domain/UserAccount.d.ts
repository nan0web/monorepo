/**
 * UserAccount — Model-as-Schema for User Identity and Profile.
 * Represents the "Who" in the OLMUI ecosystem.
 */
export class UserAccount extends Model {
    static UI: {
        title: string;
        description: string;
        icon: string;
    };
    static username: {
        help: string;
        type: string;
        required: boolean;
    };
    static email: {
        help: string;
        type: string;
        required: boolean;
        errorInvalid: string;
        validate: (v: any) => any;
    };
    static avatar: {
        help: string;
        type: string;
        default: string;
    };
    static verified: {
        help: string;
        type: string;
        default: boolean;
        readOnly: boolean;
    };
    static soulId: {
        help: string;
        alias: string;
        type: string;
        default: string;
    };
    /**
     * @param {Partial<UserAccount> | Record<string, any>} [data]
     * @param {object} [options]
     */
    constructor(data?: Partial<UserAccount> | Record<string, any>, options?: object);
    /** @type {string} */ username: string;
    /** @type {string} */ email: string;
    /** @type {string} */ avatar: string;
    /** @type {boolean} */ verified: boolean;
    /** @type {string} */ soulId: string;
}
import { Model } from '@nan0web/types';
