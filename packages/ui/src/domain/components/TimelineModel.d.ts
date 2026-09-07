/**
 * TimelineModel — OLMUI Model-as-Schema
 * A collection of timeline events (changelog, roadmap, history).
 */
export class TimelineModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
    };
    static items: {
        help: string;
        type: string;
        hint: typeof TimelineItemModel;
        default: never[];
    };
    /**
     * @param {Partial<TimelineModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<TimelineModel> | Record<string, any>, options?: object);
    /** @type {string} Timeline section title */ title: string;
    /** @type {TimelineItemModel[]} Array of timeline events */ items: TimelineItemModel[];
}
import { Model } from '@nan0web/types';
import { TimelineItemModel } from './TimelineItemModel.js';
