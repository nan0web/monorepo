/**
 * Model-as-Schema for Input component.
 */
export class InputModel extends Model {
    static type: {
        help: string;
        default: string;
        options: string[];
    };
    static label: {
        help: string;
        default: string;
        type: string;
    };
    static placeholder: {
        help: string;
        default: string;
        type: string;
    };
    static required: {
        help: string;
        default: boolean;
        type: string;
    };
    static pattern: {
        help: string;
        default: string;
        type: string;
    };
    static min: {
        help: string;
        default: string;
        type: string;
    };
    static max: {
        help: string;
        default: string;
        type: string;
    };
    static step: {
        help: string;
        default: string;
        type: string;
    };
    static hint: {
        help: string;
        default: string;
        type: string;
    };
    static disabled: {
        help: string;
        default: boolean;
        type: string;
    };
    static content: {
        help: string;
        default: string;
        type: string;
    };
    /**
     * @param {Partial<InputModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<InputModel> | Record<string, any>, options?: object);
    /** @type {string} HTML5 Input type attribute */ type: string;
    /** @type {string} Label displayed above the input */ label: string;
    /** @type {string} Placeholder text shown when empty */ placeholder: string;
    /** @type {boolean} Whether the field must be filled out */ required: boolean;
    /** @type {string} RegExp pattern for validation */ pattern: string;
    /** @type {string} Minimum value */ min: string;
    /** @type {string} Maximum value */ max: string;
    /** @type {string} Step interval */ step: string;
    /** @type {string} Helper text displayed below the input */ hint: string;
    /** @type {boolean} Whether the input is disabled */ disabled: boolean;
    /** @type {string} The actual value of the input */ content: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
