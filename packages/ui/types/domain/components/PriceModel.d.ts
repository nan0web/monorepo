/**
 * PriceModel — OLMUI Model-as-Schema
 * Represents a monetary value with currency.
 */
export class PriceModel extends Model {
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
    /** @type {number} Numeric price value */ value: number;
    /** @type {string} Currency code (ISO 4217) */ currency: string;
}
import { Model } from '@nan0web/types';
