import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Autocomplete component.
 * Represents a text input with search suggestions.
 */
export declare class AutocompleteModel extends Model {
    content: any;
    static content: {
        help: string;
        default: string;
        type: string;
    };
    static options: {
        help: string;
        default: never[];
        type: string;
    };
    /**
     * @param {Partial<AutocompleteModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<AutocompleteModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
