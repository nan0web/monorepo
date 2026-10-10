/**
 * Path and volume resolution layer for filesystem database.
 * Handles physical path detection, location, relative, realpath and volume scanning.
 *
 * @class
 * @extends {DBFSBase}
 */
export default class DBFSPath extends DBFSBase {
    /**
     * Computes a deterministic Base36 bucket and safe disk segment for a logical path segment.
     * If the segment contains a colon (like W3C DIDs 'did:nano:...'), it maps ':' -> '~'
     * and prefixes with a 2-character Base36 hash (giving 1,296 buckets).
     *
     * @param {string} segment Logical path segment
     * @returns {string} Physical path segment (e.g. '4f/did~nano~student1' or 'regular')
     */
    static resolveShardedSegment(segment: string): string;
    /**
     * Unshards a sanitized disk segment back to its logical name if it was sharded.
     * e.g. 'did~nano~student1' -> 'did:nano:student1'
     * @param {string} segment
     * @returns {string}
     */
    static unshardSegment(segment: string): string;
    /**
     * Checks if a directory entry is a 2-char Base36 shard bucket directory.
     * @param {string} name
     * @returns {boolean}
     */
    static isShardBucket(name: string): boolean;
    /**
     * Converts a physical sharded path back into a logical URI.
     * Strips 2-char shard buckets and converts '~' back to ':' in segments.
     * e.g. 'students/4f/did~nano~student1/answers/test-1.nan0' -> 'students/did:nano:student1/answers/test-1.nan0'
     * @param {string} relPath
     * @returns {string}
     */
    static unshardPath(relPath: string): string;
    /**
     * Resolves sharded segment via instance method.
     * @param {string} segment
     * @returns {string}
     */
    resolveShardedSegment(segment: string): string;
    /**
     * Instance helper for unshardPath.
     * @param {string} relPath
     * @returns {string}
     */
    unshardPath(relPath: string): string;
    /**
     * Transforms a logical URI by applying Base36 sharding to any segments containing ':'.
     * @param {string} uri
     * @returns {string}
     */
    shardUri(uri: string): string;
    /**
     * Returns location for the provided uris.
     * @param  {...any} args
     * @returns {string} Absolute location on the drive.
     */
    location(...args: any[]): string;
}
import DBFSBase from './DBFSBase.js';
