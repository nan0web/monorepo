import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Input component.
 */
export declare class InputModel extends Model {
    content: any;
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
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
