/**
 * Model-as-Schema for Tree component.
 * Represents a hierarchical selection or navigation structure.
 */
export class TreeModel extends Model {
    static data: {
        help: string;
        type: string;
        default: never[];
    };
    /**
     * @param {Partial<TreeModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<TreeModel> | Record<string, any>, options?: object);
    /** @type {Array<{label: string, expanded?: boolean, children?: any[]}>} Tree nodes */ data: Array<{
        label: string;
        expanded?: boolean;
        children?: any[];
    }>;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
