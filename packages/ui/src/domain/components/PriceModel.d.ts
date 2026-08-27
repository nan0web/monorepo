import { Model } from '@nan0web/types';
/**
 * PriceModel — OLMUI Model-as-Schema
 * Represents a monetary value with currency.
 */
export declare class PriceModel extends Model {
    static $id: string;
    static value: {
        help: string;
        default: number;
        type: string;
    };
    static currency: {
        help: string;
        placeholder: string;
        default: string;
    };
    /**
     * @param {Partial<PriceModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<PriceModel> | Record<string, any>, options?: object);
}
