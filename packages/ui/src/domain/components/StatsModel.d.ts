import { Model } from '@nan0web/types';
import { StatsItemModel } from './StatsItemModel.js';
/**
 * StatsModel — OLMUI Model-as-Schema
 * A collection of stat items for dashboards and overview sections.
 */
export declare class StatsModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
    };
    static items: {
        help: string;
        type: string;
        hint: typeof StatsItemModel;
        default: never[];
    };
    /**
     * @param {Partial<StatsModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<StatsModel> | Record<string, any>, options?: object);
}
