/**
 * Model-as-Schema for Select component.
 * Represents a dropdown choice selection.
 */
export class SelectModel extends Model {
    static content: {
        help: string;
        default: string;
        type: string;
    };
    static options: {
        help: string;
        default: string[];
        type: string;
    };
    /**
     * @param {Partial<SelectModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<SelectModel> | Record<string, any>, options?: object);
    /** @type {string} Currently selected item or default placeholder */ content: string;
    /** @type {string[]} List of available options for selection */ options: string[];
    /**
     * @returns {AsyncGenerator<any, { type: 'result', data: { selected: string } }, any>}
     */
    run(): AsyncGenerator<any, {
        type: "result";
        data: {
            selected: string;
        };
    }, any>;
}
import { Model } from '@nan0web/types';
