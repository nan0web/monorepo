export class BatchTaskModel extends Model {
    static id: {
        help: string;
        default: string;
        type: string;
    };
    static task: {
        help: string;
        default: string;
        type: string;
    };
    static context: {
        help: string;
        default: {};
        type: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ id: string;
    /** @type {string} */ task: string;
    /** @type {object} */ context: object;
}
import { Model } from '@nan0web/types';
