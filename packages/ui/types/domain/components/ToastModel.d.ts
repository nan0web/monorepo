/**
 * Model-as-Schema for Toast notification.
 */
export class ToastModel extends Model {
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
    /** @type {'info'|'success'|'warn'|'error'} Notification color scheme */ variant: "info" | "success" | "warn" | "error";
    /** @type {string} Text displayed in the toast */ message: string;
    /** @type {number} Auto-dismiss timeout in ms */ duration: number;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
