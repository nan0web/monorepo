import { Model } from '@nan0web/types';
/**
 * Model describing the Next component parameters.
 * English-only schema for Linguistic Sovereignty.
 */
export declare class NextModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    /**
     * @param {Partial<NextModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<NextModel> | Record<string, any>, options?: object);
}
