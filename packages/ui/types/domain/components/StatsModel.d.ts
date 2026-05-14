/**
 * StatsModel — OLMUI Model-as-Schema
 * A collection of stat items for dashboards and overview sections.
 */
export class StatsModel extends Model {
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
    /** @type {string} Stats section title */ title: string;
    /** @type {StatsItemModel[]} Array of stat entries */ items: StatsItemModel[];
}
import { Model } from '@nan0web/types';
import { StatsItemModel } from './StatsItemModel.js';
