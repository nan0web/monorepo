/**
 * PricingSectionModel — OLMUI Model-as-Schema
 * A section containing a title and a collection of pricing tiers.
 */
export class PricingSectionModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
    };
    static items: {
        help: string;
        type: string;
        hint: typeof PricingModel;
        default: never[];
    };
    /**
     * @param {Partial<PricingSectionModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<PricingSectionModel> | Record<string, any>, options?: object);
    /** @type {string} Section title */ title: string;
    /** @type {PricingModel[]} Array of pricing tiers */ items: PricingModel[];
}
import { Model } from '@nan0web/types';
import { PricingModel } from './PricingModel.js';
