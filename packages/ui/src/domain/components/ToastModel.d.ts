import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Toast notification.
 * @extends {Model}
 */
export declare class ToastModel extends Model {
    static $id: string;
    static UI: {
        toastLog: string;
    };
    static variant: {
        help: string;
        default: string;
        options: string[];
    };
    static message: {
        help: string;
        default: string;
        type: string;
    };
    static duration: {
        help: string;
        default: number;
        type: string;
    };
    /**
     * @param {Partial<ToastModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ToastModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
