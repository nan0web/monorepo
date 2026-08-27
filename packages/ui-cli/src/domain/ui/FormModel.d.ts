import { Model } from '@nan0web/types';
export declare class FormModel extends Model {
    static UI_VALIDATE_ERROR: {
        default: string;
    };
    static UI_SELECT: {
        default: string;
    };
    static UI_ADD: {
        default: string;
    };
    static UI_DONE: {
        default: string;
    };
    static UI_ACTION: {
        default: string;
    };
    static UI_VALUE: {
        default: string;
    };
    static UI_EDIT: {
        default: string;
    };
    static UI_DELETE: {
        default: string;
    };
    static UI_BACK: {
        default: string;
    };
    static UI_REQUIRED: {
        default: string;
    };
    /**
     * @param {Partial<FormModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<FormModel> | Record<string, any>, options?: object);
}
