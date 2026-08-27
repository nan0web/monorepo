import { Model } from '@nan0web/types';
/**
 * Model describing the Mask component parameters.
 */
export declare class MaskModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: {
        default: string;
    };
    static UI_FORMAT_MSG: {
        default: string;
    };
    static mask: {
        default: string;
    };
    /**
     * @param {Partial<MaskModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<MaskModel> | Record<string, any>, options?: object);
    /**
     * Map a predefined answer to a masked result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: string, cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: string;
        cancelled: boolean;
    };
}
