/**
 * DriveIndexCommand - Indexes storage drive and saves metadata to offline catalog.
 */
export class DriveIndexCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static mountPoint: {
        type: string;
        required: boolean;
        help: string;
    };
    static name: {
        type: string;
        required: boolean;
        help: string;
    };
    static driveId: {
        type: string;
        required: boolean;
        help: string;
    };
    /**
     * @param {object} [data]
     * @param {object} [options]
     */
    constructor(data?: object, options?: object);
    run(): AsyncGenerator<{
        type: string;
        message: string;
        level?: undefined;
    } | {
        type: string;
        level: string;
        message: string;
    }, {
        type: string;
        data: {
            success: boolean;
            drive: import("../models/DriveModel.js").DriveModel;
            totalFiles: number;
            totalBytes: number;
        };
    }, unknown>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
