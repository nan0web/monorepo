import { Model } from '@nan0web/types';
/**
 * HeaderVisibilityModel — OLMUI Model-as-Schema
 * Boolean flags controlling which header elements are visible.
 */
export declare class HeaderVisibilityModel extends Model {
    static $id: string;
    static logo: {
        help: string;
        default: boolean;
        type: string;
    };
    static theme: {
        help: string;
        default: boolean;
        type: string;
    };
    static search: {
        help: string;
        default: boolean;
        type: string;
    };
    static share: {
        help: string;
        default: boolean;
        type: string;
    };
    static nav: {
        help: string;
        default: boolean;
        type: string;
    };
    static langs: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<HeaderVisibilityModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<HeaderVisibilityModel> | Record<string, any>, options?: object);
}
