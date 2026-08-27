import { Model } from '@nan0web/types';
import { FooterVisibilityModel } from './FooterVisibilityModel.js';
/**
 * FooterConfigModel — OLMUI Model-as-Schema
 * Configuration container mapping UI variant keys to FooterVisibilityModel instances.
 */
export declare class FooterConfigModel extends Model {
    static $id: string;
    static ui: {
        help: string;
        type: string;
        hint: typeof FooterVisibilityModel;
        default: {};
    };
    /**
     * @param {Partial<FooterConfigModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<FooterConfigModel> | Record<string, any>, options?: object);
}
