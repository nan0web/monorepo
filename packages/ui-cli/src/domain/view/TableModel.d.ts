import { Model } from '@nan0web/types';
/**
 * Model describing the Table component parameters.
 */
export declare class TableModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_FILTER: {
        default: string;
    };
    static UI_NONE: {
        default: string;
    };
    static UI_FILTER_PROMPT: {
        default: string;
    };
    static data: {
        default: never[];
    };
    static columns: {
        default: never[];
    };
    static interactive: {
        default: boolean;
    };
    /**
     * @param {Partial<TableModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<TableModel> | Record<string, any>, options?: object);
}
