/**
 * TaskModel (Model-as-Schema)
 * Represents a single task item parsed from Markdown AST.
 */
export class TaskModel extends Model {
    static title: {
        type: string;
        required: boolean;
        help: string;
    };
    static status: {
        type: string;
        default: string;
        help: string;
    };
    static badges: {
        type: string;
        default: {};
        help: string;
    };
    static filePath: {
        type: string;
        default: string;
        help: string;
    };
    static lineIndex: {
        type: string;
        default: number;
        help: string;
    };
    /**
     * @param {Partial<TaskModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<TaskModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} */
    title: string;
    /** @type {'todo' | 'done' | 'work' | 'fail'} */
    status: "todo" | "done" | "work" | "fail";
    /** @type {Record<string, string>} */
    badges: Record<string, string>;
    /** @type {string} */
    filePath: string;
    /** @type {number} */
    lineIndex: number;
}
export default TaskModel;
import { Model } from '@nan0web/types';
