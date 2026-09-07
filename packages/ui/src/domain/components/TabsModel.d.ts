/**
 * TabsModel — OLMUI Model-as-Schema
 * Tab container with selectable panels.
 */
export class TabsModel extends Model {
    static $id: string;
    static active: {
        help: string;
        default: number;
        type: string;
    };
    static tabs: {
        help: string;
        type: string;
        default: never[];
    };
    /**
     * @param {Partial<TabsModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<TabsModel> | Record<string, any>, options?: object);
    /** @type {number} Index of the currently active tab */ active: number;
    /** @type {Array<{label: string, content: string}>} Tab definitions */ tabs: Array<{
        label: string;
        content: string;
    }>;
}
import { Model } from '@nan0web/types';
