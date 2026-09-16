/**
 * Path and volume resolution layer for filesystem database.
 * Handles physical path detection, location, relative, realpath and volume scanning.
 *
 * @class
 * @extends {DBFSBase}
 */
export default class DBFSPath extends DBFSBase {
    /**
     * Returns location for the provided uris.
     * @param  {...any} args
     * @returns {string} Absolute location on the drive.
     */
    location(...args: any[]): string;
}
import DBFSBase from './DBFSBase.js';
