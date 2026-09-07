/**
 * HeaderConfigModel — OLMUI Model-as-Schema
 * Configuration container mapping UI variant keys to HeaderVisibilityModel instances.
 */
export class HeaderConfigModel extends Model {
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
    /** @type {Record<string, HeaderVisibilityModel>} Map of UI variant name → HeaderVisibilityModel */ ui: Record<string, HeaderVisibilityModel>;
}
import { Model } from '@nan0web/types';
import { HeaderVisibilityModel } from './HeaderVisibilityModel.js';
