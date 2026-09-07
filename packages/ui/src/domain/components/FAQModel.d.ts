/**
 * FAQModel — OLMUI Model-as-Schema
 * A section containing a title and a collection of FAQ (accordion) items.
 */
export class FAQModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
    };
    static items: {
        help: string;
        type: string;
        hint: typeof AccordionModel;
        default: never[];
    };
    /**
     * @param {Partial<FAQModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<FAQModel> | Record<string, any>, options?: object);
    /** @type {string} Section title */ title: string;
    /** @type {AccordionModel[]} Array of FAQ items */ items: AccordionModel[];
}
import { Model } from '@nan0web/types';
import { AccordionModel } from './AccordionModel.js';
