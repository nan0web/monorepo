export class ReleaseAuditor extends Model {
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
    /** @type {string} */ dir: string;
    run(): AsyncGenerator<import("@nan0web/ui/types/core/Intent").ProgressIntent, import("@nan0web/ui/types/core/Intent").ResultIntent, unknown>;
}
import { Model } from '@nan0web/types';
