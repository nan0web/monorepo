/**
 * Packs files into a single markdown string based on a checklist.
 */
export class PackModel extends Model {
    static input: {
        help: string;
        type: string;
        positional: boolean;
    };
    static output: {
        help: string;
        type: string;
        positional: boolean;
    };
    static UI: {
        started: string;
        saved: string;
        failed: string;
        noInput: string;
        warning: string;
        info: string;
    };
    constructor(data?: {}, options?: any);
    /** @type {string} Input markdown file with checklist */ input: string;
    /** @type {string} Output packed markdown */ output: string;
    run(): AsyncGenerator<{
        type: string;
        message: any;
        level?: undefined;
    } | {
        type: string;
        level: string;
        message: any;
    }, {
        status: string;
        reason: string;
        size?: undefined;
        error?: undefined;
    } | {
        status: string;
        size: number;
        reason?: undefined;
        error?: undefined;
    } | {
        status: string;
        error: string;
        reason?: undefined;
        size?: undefined;
    }, unknown>;
}
import { Model } from '@nan0web/types';
