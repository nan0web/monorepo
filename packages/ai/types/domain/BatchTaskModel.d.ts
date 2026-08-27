import { Model } from '@nan0web/types';
export declare class BatchTaskModel extends Model {
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
}
