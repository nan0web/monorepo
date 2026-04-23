export class DocumentationAuditor extends Model {
    static UI: {
        checking: string;
        readmeJsNotFound: string;
        readmeJsFound: string;
        readmeMdNotFound: string;
        readmeMdFound: string;
        datasetNotFound: string;
        datasetFound: string;
        checkingTranslations: string;
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
