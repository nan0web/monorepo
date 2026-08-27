/**
 * DriveIndexerService - Scans directory tree, collects file sizes, and generates offline Drive catalog.
 */
export class DriveIndexerService {
    /**
     * Helper quick string hasher.
     * @param {string} str
     * @returns {string}
     */
    static hashString(str: string): string;
    /**
     * Default directory walker implementation using node:fs.
     * @param {string} rootDir
     * @returns {Promise<Array<{ relativePath: string, size: number, hash?: string, mtime?: string }>>}
     */
    static defaultWalker(rootDir: string): Promise<Array<{
        relativePath: string;
        size: number;
        hash?: string;
        mtime?: string;
    }>>;
    /**
     * @param {object} [options]
     * @param {Function} [options.walker] - Custom filesystem walker for testing.
     * @param {object} [options.db] - DB client to persist catalogs.
     */
    constructor(options?: {
        walker?: Function;
        db?: object;
    });
    walker: Function;
    db: any;
    /**
     * Scans drive directory and generates DriveModel + FileEntryModel array.
     * @param {object} params
     * @param {string} params.driveId
     * @param {string} params.name
     * @param {string} params.mountPoint
     * @returns {Promise<{ drive: DriveModel, files: FileEntryModel[], totalFiles: number, totalBytes: number }>}
     */
    indexDrive({ driveId, name, mountPoint }: {
        driveId: string;
        name: string;
        mountPoint: string;
    }): Promise<{
        drive: DriveModel;
        files: FileEntryModel[];
        totalFiles: number;
        totalBytes: number;
    }>;
}
import { DriveModel } from '../models/DriveModel.js';
import { FileEntryModel } from '../models/DriveModel.js';
