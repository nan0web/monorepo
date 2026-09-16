export default DBFS;
/**
 * Main filesystem database class for local document storage and retrieval.
 * Thin facade extending the layered inheritance chain:
 * DBFS (facade) → DBFSStream → DBFSDir → DBFSDoc → DBFSPath → DBFSBase → DB
 *
 * @class
 * @extends {DBFSStream}
 */
declare class DBFS extends DBFSStream {
    /**
     * Fixes path separators for Windows systems.
     * @param {string} path The path to fix.
     * @returns {string} The path with forward slashes.
     */
    static winFix(path: string): string;
    /**
     * Creates a DBFS instance from input parameters.
     * @param {object} input The input parameters for DBFS.
     * @returns {DBFS} A new or existing DBFS instance.
     */
    static from(input: object): DBFS;
}
import DBFSStream from './DBFS/parts/DBFSStream.js';
