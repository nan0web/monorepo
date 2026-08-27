import { Model } from '@nan0web/types';
/**
 * Model describing the Password component parameters.
 */
export declare class PasswordModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static initial: {
        default: string;
    };
    static validate: {
        alias: string;
    };
    /**
     * @param {Partial<PasswordModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<PasswordModel> | Record<string, any>, options?: object);
}
