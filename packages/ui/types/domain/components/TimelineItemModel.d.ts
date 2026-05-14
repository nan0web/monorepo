/**
 * TimelineItemModel — OLMUI Model-as-Schema
 * A single entry on a timeline (event, milestone, changelog).
 */
export class TimelineItemModel extends Model {
    static $id: string;
    static date: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static description: {
        help: string;
        placeholder: string;
        default: string;
    };
    /**
     * @param {Partial<TimelineItemModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<TimelineItemModel> | Record<string, any>, options?: object);
    /** @type {string} Date of the event */ date: string;
    /** @type {string} Event or milestone title */ title: string;
    /** @type {string} Detailed description of the event */ description: string;
}
import { Model } from '@nan0web/types';
