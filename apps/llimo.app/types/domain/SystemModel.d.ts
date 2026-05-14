export class SystemModel extends Model {
    static output: {
        help: string;
        type: string;
        positional: boolean;
    };
    static UI: {
        started: string;
        saved: string;
        failed: string;
    };
    constructor(data?: {}, options?: any);
    /** @type {string} Output file path for system prompt */ output: string;
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
        error?: undefined;
    } | {
        status: string;
        error: string;
    }, unknown>;
}
import { Model } from '@nan0web/types';
