import { Model } from '@nan0web/types';
import { PriceModel } from './PriceModel.js';
/**
 * PricingModel — OLMUI Model-as-Schema
 * A pricing tier/plan with title, price, and feature list.
 */
export declare class PricingModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static price: {
        help: string;
        type: string;
        hint: typeof PriceModel;
        default: null;
    };
    static features: {
        help: string;
        type: string;
        default: never[];
    };
    /**
     * @param {Partial<PricingModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<PricingModel> | Record<string, any>, options?: object);
}
