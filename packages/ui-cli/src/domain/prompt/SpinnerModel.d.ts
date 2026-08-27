import { Model } from '@nan0web/types';
/**
 * Model describing the Spinner activity component.
 */
export declare class SpinnerModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_DONE: {
        alias: string;
        default: string;
    };
    static UI_ERROR: {
        alias: string;
        default: string;
    };
    /**
     * @param {Partial<SpinnerModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SpinnerModel> | Record<string, any>, options?: object);
}
