import { Model } from '@nan0web/types';
export declare class ReleaseAuditor extends Model {
    static UI: {
        checking: string;
        releaseJsonNotFound: string;
        releaseJsonFound: string;
        datasetNotFound: string;
        datasetFound: string;
    };
    static dir: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
