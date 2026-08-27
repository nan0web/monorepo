/**
 * DriveModel - Represents physical or virtual storage drive (online or offline catalog).
 */
export class DriveModel extends Model {
    static id: {
        help: string;
        default: any;
    };
    static name: {
        help: string;
        default: any;
    };
    static mountPoint: {
        help: string;
        default: any;
    };
    static totalSpace: {
        help: string;
        default: number;
    };
    static freeSpace: {
        help: string;
        default: number;
    };
    static status: {
        help: string;
        default: string;
    };
    static lastIndexedAt: {
        help: string;
        default: any;
    };
    /**
     * @param {Partial<DriveModel>} [data]
     * @param {object} [options]
     */
    constructor(data?: Partial<DriveModel>, options?: object);
    id: any;
    name: any;
    mountPoint: any;
    totalSpace: number;
    freeSpace: number;
    status: any;
    lastIndexedAt: any;
}
/**
 * FileEntryModel - Single indexed file record in the offline drive catalog.
 */
export class FileEntryModel extends Model {
    static driveId: {
        help: string;
        default: any;
    };
    static relativePath: {
        help: string;
        default: any;
    };
    static size: {
        help: string;
        default: number;
    };
    static hash: {
        help: string;
        default: any;
    };
    static mtime: {
        help: string;
        default: any;
    };
    /**
     * @param {Partial<FileEntryModel>} [data]
     * @param {object} [options]
     */
    constructor(data?: Partial<FileEntryModel>, options?: object);
    driveId: any;
    relativePath: any;
    size: number;
    hash: any;
    mtime: any;
}
import { Model } from '../Models.js';
