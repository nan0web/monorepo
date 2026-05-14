/**
 * Model-as-Schema for Table Data component.
 * Displays tabular string data in rows and columns.
 */
export class TableModel extends Model {
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
    /** @type {string[]} Array of column headers */ columns: string[];
    /** @type {string[][]} 2D Array of table cells matching column length */ rows: string[][];
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
