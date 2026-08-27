import { Model } from '@nan0web/types';
/**
 * Model describing the Autocomplete component parameters.
 */
export declare class AutocompleteModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static options: {
        default: never[];
    };
    /**
     * @param {Partial<AutocompleteModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<AutocompleteModel> | Record<string, any>, options?: object);
}
