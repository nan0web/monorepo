/**
 * Model-as-Schema for Autocomplete component.
 * Represents a text input with search suggestions.
 */
export class AutocompleteModel extends Model {
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
    /** @type {string} Current search text */ content: string;
    /** @type {string[]} List of suggestions based on input */ options: string[];
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
