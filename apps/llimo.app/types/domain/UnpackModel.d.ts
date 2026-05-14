export class UnpackModel extends Model {
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
    static dry: {
        help: string;
        type: string;
        default: boolean;
    };
    static UI: {
        started: string;
        failed: string;
        noInput: string;
    };
    constructor(data?: {}, options?: any);
    /** @type {string} Input markdown file */ input: string;
    /** @type {string} Output directory */ output: string;
    /** @type {boolean} Dry run without saving files */ dry: boolean;
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
        error?: undefined;
    } | {
        status: string;
        reason?: undefined;
        error?: undefined;
    } | {
        status: string;
        error: string;
        reason?: undefined;
    }, unknown>;
}
import { Model } from '@nan0web/types';
