import { Model } from '@nan0web/types';
/**
 * Model describing the Input component parameters.
 */
export declare class InputModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: {
        default: string;
    };
    static initial: {
        alias: string;
        default: string;
    };
    static type: {
        default: string;
    };
    static validate: {
        alias: string;
    };
    static format: {
        default: null;
    };
    /**
     * @param {Partial<InputModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<InputModel> | Record<string, any>, options?: object);
}
