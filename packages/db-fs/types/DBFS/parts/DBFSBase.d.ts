/**
 * Base filesystem database class.
 * Foundation layer that inherits from DB and registers filesystem formats.
 *
 * @class
 * @extends {DB}
 */
export default class DBFSBase extends DB {
    static FS: typeof FS;
    static Driver: typeof FSDriver;
    /**
     * @param {object} [input={}]
     */
    constructor(input?: object);
    /**
     * Array of loader functions that attempt to load data from a file path.
     * Each loader returns false if it cannot handle the data format.
     * @type {((file: string, data: any, ext: string) => any)[]}
     */
    loaders: ((file: string, data: any, ext: string) => any)[];
    /**
     * Array of saver functions that attempt to save data to a file path.
     * Each saver returns false if it cannot handle the data format.
     * @type {((file: string, data: any, ext: string) => any)[]}
     */
    savers: ((file: string, data: any, ext: string) => any)[];
    /**
     * @returns {typeof FS}
     */
    get FS(): typeof FS;
}
import DB from '@nan0web/db';
import FS from '../../FSAdapter.js';
import FSDriver from '../../FSDriver.js';
