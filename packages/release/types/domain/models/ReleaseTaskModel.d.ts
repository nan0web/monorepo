export class ReleaseTaskModel extends Model {
    static id: {
        type: string;
        required: boolean;
    };
    static title: {
        type: string;
        required: boolean;
    };
    static status: {
        type: string;
        default: string;
    };
    static assignee: {
        type: string;
    };
    static estimateHours: {
        type: string;
    };
    static spentHours: {
        type: string;
    };
    static notes: {
        type: string;
    };
    /**
     * @param {Partial<ReleaseTaskModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseTaskModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Task ID */
    id: string;
    /** @type {string} Task Title */
    title: string;
    /** @type {'todo' | 'work' | 'done' | 'fail'} Task Status */
    status: "todo" | "work" | "done" | "fail";
    /** @type {string} Assignee */
    assignee: string;
    /** @type {number} Estimated Hours */
    estimateHours: number;
    /** @type {number} Spent Hours */
    spentHours: number;
    /** @type {string} Notes */
    notes: string;
}
import { Model } from '@nan0web/types';
