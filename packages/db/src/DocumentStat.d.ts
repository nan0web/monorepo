/**
 * Represents statistics for a document in the filesystem
 * @class
 */
declare class DocumentStat {
    /** @type {number} */
    atimeMs: number;
    /** @type {number} */
    btimeMs: number;
    /** @type {number} */
    blksize: number;
    /** @type {number} */
    blocks: number;
    /** @type {number} */
    ctimeMs: number;
    /** @type {number} */
    dev: number;
    /** @type {number} */
    gid: number;
    /** @type {number} */
    ino: number;
    /** @type {number} */
    mode: number;
    /** @type {number} */
    mtimeMs: number;
    /** @type {number} */
    size: number;
    /** @type {number} */
    nlink: number;
    /** @type {number} */
    rdev: number;
    /** @type {number} */
    uid: number;
    /** @type {boolean} */
    isBlockDevice: boolean;
    /** @type {boolean} */
    isDirectory: boolean;
    /** @type {boolean} */
    isFile: boolean;
    /** @type {boolean} */
    isFIFO: boolean;
    /** @type {boolean} */
    isSocket: boolean;
    /** @type {boolean} */
    isSymbolicLink: boolean;
    /** @type {Error|null} */
    error: Error | null;
    /**
     * Creates a new DocumentStat instance
     * @param {object} input
     * @param {number} [input.atimeMs=0]
     * @param {number} [input.btimeMs=0]
     * @param {number} [input.blksize=0]
     * @param {number} [input.blocks=0]
     * @param {number} [input.ctimeMs=0]
     * @param {number} [input.dev=0]
     * @param {number} [input.gid=0]
     * @param {number} [input.ino=0]
     * @param {number} [input.mode=0]
     * @param {number} [input.mtimeMs=0]
     * @param {number} [input.nlink=0]
     * @param {number} [input.rdev=0]
     * @param {number} [input.size=0]
     * @param {number} [input.uid=0]
     * @param {boolean} [input.isBlockDevice=false]
     * @param {boolean} [input.isDirectory=false]
     * @param {boolean} [input.isFile=false]
     * @param {boolean} [input.isFIFO=false]
     * @param {boolean} [input.isSocket=false]
     * @param {boolean} [input.isSymbolicLink=false]
     * @param {boolean} [input.type=""] The file type if provided then used: F, D.
     * @param {Error|null} [input.error=null]
     */
    constructor(input?: {
        atimeMs?: number;
        btimeMs?: number;
        blksize?: number;
        blocks?: number;
        ctimeMs?: number;
        dev?: number;
        gid?: number;
        ino?: number;
        mode?: number;
        mtimeMs?: number;
        nlink?: number;
        rdev?: number;
        size?: number;
        uid?: number;
        isBlockDevice?: boolean;
        isDirectory?: boolean;
        isFile?: boolean;
        isFIFO?: boolean;
        isSocket?: boolean;
        isSymbolicLink?: boolean;
        type?: boolean;
        error?: Error | null;
    });
    /**
     * Get access time as Date object
     * @returns {Date}
     */
    get atime(): Date;
    /**
     * Get birth time as Date object
     * @returns {Date}
     */
    get btime(): Date;
    /**
     * Get change time as Date object
     * @returns {Date}
     */
    get ctime(): Date;
    /**
     * Get modification time as Date object
     * @returns {Date}
     */
    get mtime(): Date;
    /**
     * Check if document exists
     * @returns {boolean}
     */
    get exists(): boolean;
    /**
     * Returns the short file type: D, F, ?
     * @returns {string}
     */
    get type(): string;
    /**
     * Creates DocumentStat instance from input
     * @param {object|DocumentStat} input - Properties or existing instance
     * @returns {DocumentStat}
     */
    static from(input: object | DocumentStat): DocumentStat;
}
export default DocumentStat;
