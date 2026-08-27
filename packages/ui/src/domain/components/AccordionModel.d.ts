import { Model } from '@nan0web/types';
/**
 * AccordionModel — OLMUI Model-as-Schema
 * Collapsible FAQ / accordion item with title + content.
 */
export declare class AccordionModel extends Model {
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
}
