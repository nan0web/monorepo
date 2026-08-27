import { Model } from '@nan0web/types';
export declare class WorkspaceInspectorModel extends Model {
    static name: {
        help: string;
        default: string;
        type: string;
    };
    static type: {
        help: string;
        default: string;
        type: string;
    };
    static command: {
        help: string;
        default: string;
        type: string;
    };
    constructor(data?: {}, options?: {});
}
