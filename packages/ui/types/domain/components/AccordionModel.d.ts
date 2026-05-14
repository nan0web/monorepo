/**
 * AccordionModel — OLMUI Model-as-Schema
 * Collapsible FAQ / accordion item with title + content.
 */
export class AccordionModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static content: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static open: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<AccordionModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<AccordionModel> | Record<string, any>, options?: object);
    /** @type {string} Accordion item header / question */ title: string;
    /** @type {string} Accordion item body / answer (supports markdown) */ content: string;
    /** @type {boolean} Whether the item is expanded by default */ open: boolean;
}
import { Model } from '@nan0web/types';
