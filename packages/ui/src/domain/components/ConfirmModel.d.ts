import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Confirmation dialog.
 */
export declare class ConfirmModel extends Model {
    static title: {
        help: string;
        default: string;
        type: string;
    };
    static message: {
        help: string;
        default: string;
        type: string;
    };
    static okLabel: {
        help: string;
        default: string;
        type: string;
    };
    static cancelLabel: {
        help: string;
        default: string;
        type: string;
    };
    /**
     * @param {Partial<ConfirmModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ConfirmModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
