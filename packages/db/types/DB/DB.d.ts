/**
 * Main database class for document storage and retrieval.
 * This is a thin facade that extends the layered inheritance chain (DBModel → DBFetch → DBDir → DBDoc → DBAccess → DBBase).
 * Provides static fields, duck-typing, and factory methods for backward compatibility.
 *
 * @class
 * @extends {DBModel}
 */
export default class DB extends DBModel {
    static Data: typeof Data;
    static Directory: typeof Directory;
    static Driver: typeof DBDriverProtocol;
    static Index: typeof DirectoryIndex;
    static GetOptions: typeof GetOptions;
    static FetchOptions: typeof FetchOptions;
    static DATA_EXTNAMES: string[];
    /**
     * Creates a new DB instance from input object.
     * Supports DB instances, plain objects with constructor options, or undefined.
     * @param {object | DB} input - Input object or DB instance
     * @returns {DB} New DB instance
     */
    static from(input: object | DB): DB;
}
import DBModel from './parts/DBModel.js';
import Data from '../Data.js';
import Directory from '../Directory.js';
import DBDriverProtocol from './DriverProtocol.js';
import DirectoryIndex from '../DirectoryIndex.js';
import GetOptions from './GetOptions.js';
import FetchOptions from './FetchOptions.js';
