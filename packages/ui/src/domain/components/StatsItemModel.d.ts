import { Model } from '@nan0web/types';
/**
 * StatsItemModel — OLMUI Model-as-Schema
 * A single stat entry (e.g. "Users: 10,000 ↑12%").
 */
export declare class StatsItemModel extends Model {
    static $id: string;
    static label: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static value: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static trend: {
        help: string;
        placeholder: string;
        default: string;
    };
    /**
     * @param {Partial<StatsItemModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<StatsItemModel> | Record<string, any>, options?: object);
}
