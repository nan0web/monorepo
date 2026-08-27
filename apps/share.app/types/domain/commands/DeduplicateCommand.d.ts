/**
 * DeduplicateCommand - Scans directory or indexed drive to detect and report duplicates.
 */
export class DeduplicateCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static dir: {
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
            duplicateCount: number;
            wastedBytes: number;
            duplicates: {
                hash: string;
                size: number;
                instances: Array<{
                    relativePath: string;
                    driveId?: string;
                }>;
                wastedBytes: number;
            }[];
        };
    }, unknown>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
