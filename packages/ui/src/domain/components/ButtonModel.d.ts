import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Button component.
 */
export declare class ButtonModel extends Model {
    clicked: any;
    static variant: {
        help: string;
        default: string;
        options: string[];
    };
    static content: {
        help: string;
        default: string;
        type: string;
    };
    static href: {
        help: string;
        default: string;
        type: string;
    };
    static disabled: {
        help: string;
        default: boolean;
        type: string;
    };
    static clicked: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<ButtonModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ButtonModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
