import { Model } from '@nan0web/types';
/**
 * FooterVisibilityModel — OLMUI Model-as-Schema
 * Boolean flags controlling which footer elements are visible.
 */
export declare class FooterVisibilityModel extends Model {
    static $id: string;
    static copyright: {
        help: string;
        default: boolean;
        type: string;
    };
    static version: {
        help: string;
        default: boolean;
        type: string;
    };
    static license: {
        help: string;
        default: boolean;
        type: string;
    };
    static nav: {
        help: string;
        default: boolean;
        type: string;
    };
    static clock: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<FooterVisibilityModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<FooterVisibilityModel> | Record<string, any>, options?: object);
}
