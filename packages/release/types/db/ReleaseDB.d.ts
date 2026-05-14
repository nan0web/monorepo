export default ReleaseDB;
/**
 * ReleaseDB – thin wrapper around DBFS that adds a convenient `releases`
 * getter returning all release directories discovered under the root.
 *
 * The underlying DBFS stores a `Map` called `data` where each key is a
 * relative file path (e.g. "1/0/v1.0.0/release.js").
 */
declare class ReleaseDB extends DBFS {
    /**
     * @param {object} input
     * @returns {ReleaseDB}
     */
    static from(input: object): ReleaseDB;
    /**
     * @param {string} uri
     * @returns {ReleaseDB}
     */
    extract(uri: string): ReleaseDB;
    /**
     * @param {string} version
     * @returns {ReleaseDB}
     */
    extractVersion(version: string): ReleaseDB;
    /**
     * @returns {Array<string>} List of discovered release root paths
     */
    get releases(): Array<string>;
}
import DBFS from '@nan0web/db-fs';
