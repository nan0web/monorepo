import { Model } from '@nan0web/types';
/**
 * BannerModel — OLMUI Model-as-Schema
 * Global notification bar (cookies, maintenance, announcements).
 */
export declare class BannerModel extends Model {
    static $id: string;
    static text: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static href: {
        help: string;
        placeholder: string;
        default: string;
    };
    static closable: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<BannerModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<BannerModel> | Record<string, any>, options?: object);
}
