import { Model } from '@nan0web/types';
/**
 * Model describing the ProgressBar component parameters.
 */
export declare class ProgressBarModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_ERROR: {
        alias: string;
        default: string;
    };
    static initial: {
        default: number;
    };
    static total: {
        default: number;
    };
    /**
     * @param {Partial<ProgressBarModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ProgressBarModel> | Record<string, any>, options?: object);
}
