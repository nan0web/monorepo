import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Table Data component.
 * Displays tabular string data in rows and columns.
 * @extends {Model}
 */
export declare class TableModel extends Model {
    static $id: string;
    static UI: {
        displayingTable: string;
    };
    static columns: {
        help: string;
        type: string;
        default: string[];
    };
    static rows: {
        help: string;
        type: string;
        default: string[][];
    };
    /**
     * @param {Partial<TableModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<TableModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
