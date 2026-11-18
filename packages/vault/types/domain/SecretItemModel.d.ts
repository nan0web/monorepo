/**
 * SecretItemModel - Single secret credential or note item in the vault.
 */
export class SecretItemModel extends Model {
    static id: {
        help: string;
        required: boolean;
    };
    static title: {
        help: string;
        default: string;
    };
    static username: {
        help: string;
        default: string;
    };
    static password: {
        help: string;
        default: string;
    };
    static secret: {
        help: string;
        default: string;
    };
    static notes: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<SecretItemModel>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<SecretItemModel>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */ id: string;
    /** @type {string} */ title: string;
    /** @type {string} */ username: string;
    /** @type {string} */ password: string;
    /** @type {string} */ secret: string;
    /** @type {string} */ notes: string;
}
import { Model } from '@nan0web/types';
