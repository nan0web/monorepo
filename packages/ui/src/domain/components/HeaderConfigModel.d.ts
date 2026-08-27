import { Model } from '@nan0web/types';
import { HeaderVisibilityModel } from './HeaderVisibilityModel.js';
/**
 * HeaderConfigModel — OLMUI Model-as-Schema
 * Configuration container mapping UI variant keys to HeaderVisibilityModel instances.
 */
export declare class HeaderConfigModel extends Model {
    static $id: string;
    static ui: {
        help: string;
        type: string;
        hint: typeof HeaderVisibilityModel;
        default: {};
    };
    /**
     * @param {Partial<HeaderConfigModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<HeaderConfigModel> | Record<string, any>, options?: object);
}
